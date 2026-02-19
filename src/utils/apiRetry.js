import axios from 'axios';

/**
 * Enterprise API Helper
 * Adds exponential backoff retry logic to axios.
 */

const MAX_RETRIES = 3;

/**
 * Sleep helper
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Resilient Fetch Wrapper
 * @param {string} url 
 * @param {object} options - Axios options
 * @param {number} retries - Current retry count
 */
export const fetchWithRetry = async (url, options = {}, retries = 0) => {
    try {
        const response = await axios({ url, ...options });
        return response;
    } catch (error) {
        // Don't retry if it's a client error (4xx), only server/network (5xx or network)
        const isRetryable = !error.response || (error.response.status >= 500 && error.response.status < 600);

        if (isRetryable && retries < MAX_RETRIES) {
            const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
            console.warn(`Request failed. Retrying in ${delay}ms... (${retries + 1}/${MAX_RETRIES})`);
            await wait(delay);
            return fetchWithRetry(url, options, retries + 1);
        }

        throw error;
    }
};
