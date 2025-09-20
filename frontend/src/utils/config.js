// Utility function to get backend URL
export const getBackendUrl = () => {
  // Use environment variable if available, otherwise fallback to dynamic detection
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  if (typeof window !== "undefined") {
    // Use the same host as the frontend but with port 8000
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${host}:8000`;
  }
  return "http://localhost:8000";
};

// Utility function to get API base URL
export const getApiBaseUrl = () => {
  return `${getBackendUrl()}/api`;
};
