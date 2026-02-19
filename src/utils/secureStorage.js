/**
 * Secure Storage Utility for Enterprise Exam System
 * 
 * Purpose: 
 * Wraps localStorage/sessionStorage to prevent casual tampering by students in DevTools.
 * Uses a simple XOR + Base64 obfuscation. 
 * NOTE: For higher security, replace the xorEncrypt/Decrypt with a library like 'crypto-js' (AES).
 */

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY 

// Simple XOR encryption (sufficient to stop 99% of students, but not cryptographically secure)
const xorEncrypt = (text, key) => {
    if (!text) return '';
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
};

const xorDecrypt = (encoded, key) => {
    if (!encoded) return '';
    try {
        const text = atob(encoded); // Base64 decode
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    } catch (e) {
        console.warn("Storage check failed", e);
        return null;
    }
};

export const secureStorage = {
    /**
     * Set item in Storage (default: localStorage)
     * @param {string} key 
     * @param {any} value 
     * @param {Storage} storageType - localStorage or sessionStorage
     */
    setItem: (key, value, storageType = localStorage) => {
        try {
            const stringValue = JSON.stringify(value);
            const encrypted = xorEncrypt(stringValue, SECRET_KEY);
            storageType.setItem(key, encrypted);
        } catch (e) {
            console.error("SecureStorage Set Error:", e);
        }
    },

    /**
     * Get item from Storage
     * @param {string} key 
     * @param {Storage} storageType 
     * @returns {any} parsed value or null
     */
    getItem: (key, storageType = localStorage) => {
        try {
            const encrypted = storageType.getItem(key);
            if (!encrypted) return null;

            const decrypted = xorDecrypt(encrypted, SECRET_KEY);
            return decrypted ? JSON.parse(decrypted) : null;
        } catch (e) {
            console.error("SecureStorage Get Error:", e);
            return null;
        }
    },

    /**
     * Remove item
     */
    removeItem: (key, storageType = localStorage) => {
        storageType.removeItem(key);
    },

    /**
     * Clear all (use with caution)
     */
    clear: (storageType = localStorage) => {
        storageType.clear();
    }
};
