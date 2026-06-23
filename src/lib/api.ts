// Central API client — reads base URL from environment variable.
// No hardcoded URLs. All secrets stay on the server.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

function getToken(): string | null {
  return localStorage.getItem("starvis_jwt_token");
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({})) as { message?: string };
    throw new ApiError(
      errData.message ?? `Request failed with status ${response.status}`,
      response.status
    );
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  return response.json() as Promise<T>;
}

export const api = {
  get: <T = unknown>(path: string) =>
    apiRequest<T>(path, { method: "GET" }),
  post: <T = unknown>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T = unknown>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T = unknown>(path: string) =>
    apiRequest<T>(path, { method: "DELETE" }),
};

export { ApiError };
export default api;
