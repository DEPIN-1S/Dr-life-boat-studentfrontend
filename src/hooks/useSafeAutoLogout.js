import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Auto Logout Hook
 * @param {number} timeoutMs - Inactivity time before logout (e.g. 15 min)
 * @param {number} warningMs - Time to show warning before logout (e.g. 1 min)
 */
export const useSafeAutoLogout = (timeoutMs = 900000, warningMs = 60000) => {
    const [isWarning, setIsWarning] = useState(false);
    const lastActivityRef = useRef(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const resetTimer = () => {
            lastActivityRef.current = Date.now();
            if (isWarning) setIsWarning(false);
        };

        // Attach listeners
        events.forEach(event => window.addEventListener(event, resetTimer));

        const interval = setInterval(() => {
            const now = Date.now();
            const inactiveTime = now - lastActivityRef.current;

            if (inactiveTime > timeoutMs) {
                // Logout
                clearInterval(interval);
                // Clear tokens
                sessionStorage.clear();
                navigate('/login');
            } else if (inactiveTime > timeoutMs - warningMs) {
                // Show Warning
                setIsWarning(true);
            }
        }, 1000);

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearInterval(interval);
        };
    }, [timeoutMs, warningMs, isWarning, navigate]);

    return { isWarning };
};
