export const getBaseURL = () => {
  // Prioritize environment variable, ensure no trailing slash
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  // Fallback to the new api subdomain
  return "https://api.183housingsolutions.com/api/v1";
};

export const baseUrl = getBaseURL();

export const getAssetBaseURL = () => {
  // Derive asset base from the current API base URL
  // This will strip /api/v1 or /api from the end
  return baseUrl.replace(/\/api(\/v1)?$/, '');
};

/**
 * Centralized utility to handle image URLs.
 * Prepends the asset base URL if the path is relative.
 */
export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  const base = getAssetBaseURL();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
