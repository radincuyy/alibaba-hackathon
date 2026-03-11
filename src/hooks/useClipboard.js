import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for clipboard operations with automatic cleanup.
 * Prevents memory leaks from lingering setTimeout handles on unmount.
 *
 * @param {number} [resetDelay=2000] - ms before `copied` resets to false.
 * @returns {{ copied: boolean, copyToClipboard: (text: string) => Promise<void> }}
 */
export function useClipboard(resetDelay = 2000) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const copyToClipboard = useCallback(async (text) => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Fallback for older browsers / non-HTTPS contexts
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        setCopied(true);

        // Clear any existing timer before setting a new one
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => setCopied(false), resetDelay);
    }, [resetDelay]);

    return { copied, copyToClipboard };
}
