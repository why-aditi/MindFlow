import { auth } from "../config/firebase";
import { getBackendUrl } from "./config";

// API client with automatic token refresh and retry
class ApiClient {
  constructor() {
    this.baseURL = getBackendUrl();
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // Process failed requests queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Refresh Firebase token
  async refreshToken() {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      const idToken = await auth.currentUser.getIdToken(true); // Force refresh

      // Send to backend to refresh session
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Token refreshed successfully");
        return idToken;
      } else {
        throw new Error(`Token refresh failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }

  // Make API request with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Get current token
    let token = null;
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
      } catch (error) {
        console.error("Error getting token:", error);
        throw new Error("Authentication required");
      }
    }

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle token expiration
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));

      if (
        errorData.error === "Token expired" ||
        errorData.error === "Invalid token"
      ) {
        // If we're already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            return this.request(endpoint, options);
          });
        }

        this.isRefreshing = true;

        try {
          // Try to refresh the token
          const newToken = await this.refreshToken();

          // Update headers with new token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          // Retry the original request
          const retryResponse = await fetch(url, {
            ...options,
            headers: newHeaders,
            credentials: "include",
          });

          this.processQueue(null, newToken);
          return retryResponse;
        } catch (refreshError) {
          this.processQueue(refreshError, null);

          // If refresh fails, trigger logout
          console.error("Token refresh failed, logging out user");
          window.dispatchEvent(new CustomEvent("token-expired"));

          throw new Error("Session expired. Please sign in again.");
        } finally {
          this.isRefreshing = false;
        }
      }
    }

    return response;
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const { get, post, put, delete: del } = apiClient;
