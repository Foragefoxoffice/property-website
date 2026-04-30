export const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Client-side: Use the relative path by default for same-domain hosting.
    // If you ever move the backend to a different domain, you can set NEXT_PUBLIC_API_URL.
    return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
  }

  // Server-side (Build time or SSR):
  // Next.js needs an absolute URL on the server.
  // We use http://127.0.0.1:5002/api/v1 (Internal loopback) during build.
  return process.env.INTERNAL_API_URL || "http://127.0.0.1:5000/api/v1";
};

export const baseUrl = getBaseURL();

export const getAssetBaseURL = () => {
  // Removes the /api/v1 suffix to get the base URL for images/assets
  return baseUrl.replace(/\/api\/v1$/, "").replace(/\/$/, "");
};
