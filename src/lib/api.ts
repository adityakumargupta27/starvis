const BASE_URL = "http://localhost:5000/api";

async function apiRequest(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("starvis_jwt_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (path: string) => apiRequest(path, { method: "GET" }),
  post: (path: string, body: any) => apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) => apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => apiRequest(path, { method: "DELETE" }),
};
export default api;
