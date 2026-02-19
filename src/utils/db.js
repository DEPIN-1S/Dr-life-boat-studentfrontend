/**
 * IndexedDB Wrapper for Offline Exam System
 * 
 * Stores:
 * 1. exam_answers: Backup of all answers (preserves history)
 * 2. sync_queue: Failed submissions waiting for internet
 */

const DB_NAME = 'ExamSystemDB';
const DB_VERSION = 1;

let dbPromise = null;

const openDB = () => {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Store 1: All answers (local backup)
            if (!db.objectStoreNames.contains('exam_answers')) {
                db.createObjectStore('exam_answers', { keyPath: 'questionId' });
            }

            // Store 2: Sync Queue (pending requests)
            if (!db.objectStoreNames.contains('sync_queue')) {
                const queueStore = db.createObjectStore('sync_queue', { autoIncrement: true });
                queueStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });

    return dbPromise;
};

export const dbService = {
    /**
     * Save answer locally (always call this)
     */
    saveAnswer: async (examId, questionId, answer) => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('exam_answers', 'readwrite');
            const store = tx.objectStore('exam_answers');
            store.put({
                examId,
                questionId,
                answer,
                timestamp: Date.now()
            });
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    },

    /**
     * Add request to sync queue (when offline)
     */
    addToSyncQueue: async (payload) => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('sync_queue', 'readwrite');
            const store = tx.objectStore('sync_queue');
            store.add({
                ...payload,
                timestamp: Date.now(),
                retryCount: 0
            });
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    },

    /**
     * Get all pending sync items
     */
    getSyncQueue: async () => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('sync_queue', 'readonly');
            const store = tx.objectStore('sync_queue');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Remove item from queue after successful sync
     */
    removeFromQueue: async (key) => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('sync_queue', 'readwrite');
            const store = tx.objectStore('sync_queue');
            store.delete(key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    },

    /**
     * Clear all local answers (after successful exam submission)
     */
    clearExamData: async () => {
        const db = await openDB();
        const tx = db.transaction(['exam_answers', 'sync_queue'], 'readwrite');
        tx.objectStore('exam_answers').clear();
        tx.objectStore('sync_queue').clear();
        return tx.complete;
    }
};
