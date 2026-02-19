import { useEffect, useRef } from 'react';

/**
 * Memory Safe Effect
 * Prevents "Can't perform a React state update on an unmounted component"
 * by providing an `isMounted` ref.
 */
export const useMemorySafeEffect = (effect, deps) => {
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        // Call the effect, passing the isMounted ref
        const cleanup = effect(isMountedRef);

        return () => {
            isMountedRef.current = false;
            if (cleanup && typeof cleanup === 'function') {
                cleanup();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};
