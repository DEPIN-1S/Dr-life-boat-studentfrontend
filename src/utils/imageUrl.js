import { API_BASE_URL } from './apiConfig';

/**
 * Returns a properly formatted image URL.
 * If the path is an absolute S3 URL, it returns it as is.
 * Otherwise, it prefixes it with the API_BASE_URL.
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalizedPath = path.replace(/\\/g, "/");
  const cleanPath = normalizedPath.replace(/^[\/\\]+/, "");
  const base = API_BASE_URL || '';
  const separator = cleanPath.startsWith('/') ? '' : '/';
  return `${base}${separator}${cleanPath}`;
};
