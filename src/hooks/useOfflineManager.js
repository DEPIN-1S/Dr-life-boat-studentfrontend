import { useState, useEffect } from 'react';
import { dbService } from '../utils/db'; // Ensure this path is correct
import axios from 'axios';

/**
 * Enterprise Offline Manager Hook
 * @param {string} syncUrl - API endpoint to sync data to
 */
export const useOfflineManager = (syncUrl) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            processSyncQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check for pending items
        processSyncQueue();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Run once on mount

    /**
     * Process the IndexedDB queue
     */
    const processSyncQueue = async () => {
        if (!navigator.onLine || isSyncing) return;

        setIsSyncing(true);
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        try {
            const queue = await dbService.getSyncQueue(); // Helper we built
            if (queue.length === 0) {
                setIsSyncing(false);
                return;
            }

            console.log(`[OfflineManager] Syncing ${queue.length} items...`);

            for (const item of queue) {
                try {
                    // Attempt to send
                    await axios.post(syncUrl, item, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    // If success, remove from queue
                    await dbService.removeFromQueue(item.id); // Assuming dbService adds an ID
                } catch (err) {
                    console.error("Sync failed for item", item, err);
                    // Keep in queue, maybe increment retry count
                }
            }
        } catch (err) {
            console.error("Error processing sync queue:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    /**
     * Safe Submit: Tries network first, falls back to queue
     */
    const safeSubmit = async (payload) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        if (isOnline) {
            try {
                const response = await axios.post(syncUrl, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return { success: true, response };
            } catch (err) {
                console.warn("Network failed, queuing...", err);
                // Fallthrough to queue logic
            }
        }

        // Offline or Network Failed -> Queue it
        try {
            await dbService.addToSyncQueue(payload);
            return { success: true, queued: true }; // Treat as success for UI
        } catch (err) {
            console.error("Critical: Could not save to offline DB", err);
            return { success: false, error: err };
        }
    };

    return { isOnline, isSyncing, safeSubmit };
};
