const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    throw new Error("Unauthorized. Please login again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "API request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
