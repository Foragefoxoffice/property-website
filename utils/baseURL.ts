export const getBaseURL = () => {
  // Use the public API URL from environment variables, fallback to the api subdomain if not set
  return process.env.NEXT_PUBLIC_API_URL || "https://api.183housingsolutions.com/api/v1";
};


export const baseUrl = getBaseURL();

export const getAssetBaseURL = () => {
  // Deriving asset base from API URL to ensure consistency across subdomains
  return baseUrl.replace('/api/v1', '');
};

