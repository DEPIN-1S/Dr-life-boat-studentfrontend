import { useState, useEffect } from 'react';

/**
 * Checks for version updates
 * @param {number} checkIntervalMs - How often to check (default 5 min)
 */
export const useVersionCheck = (checkIntervalMs = 300000) => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [currentVersion, setCurrentVersion] = useState(null);

    useEffect(() => {
        // 1. Get current version from meta tag or config
        // In index.html, add <meta name="app-version" content="1.0.0" />
        // Or just fetch local version.json once on mount

        // For this example, we'll assume we fetch '/version.json'

        const checkVersion = async () => {
            try {
                const response = await fetch('/version.json?t=' + Date.now());
                if (!response.ok) return;

                const data = await response.json();
                const serverVersion = data.version;

                // Initial set
                if (!currentVersion) {
                    setCurrentVersion(serverVersion);
                } else if (serverVersion !== currentVersion) {
                    setUpdateAvailable(true);
                }
            } catch (err) {
                // Silent fail
            }
        };

        // Check immediately
        checkVersion();

        // Check periodically
        const interval = setInterval(checkVersion, checkIntervalMs);

        return () => clearInterval(interval);
    }, [currentVersion]);

    const reloadApp = () => {
        window.location.reload(true);
    };

    return { updateAvailable, reloadApp };
};
