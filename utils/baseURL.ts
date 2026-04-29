export const baseUrl =
  typeof window === "undefined"
    ? "http://127.0.0.1:5000/api/v1"
    : "/api/v1";

export const getBaseURL = () => {
  return baseUrl;
}

export const getAssetBaseURL = () => {
  return getBaseURL().replace(/\/api\/v1$/, '').replace(/\/$/, '')
}
