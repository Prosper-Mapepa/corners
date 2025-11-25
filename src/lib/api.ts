const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

type RequestOptions = RequestInit & {
  auth?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {})
  headers.set("Content-Type", "application/json")
  if (options.auth) {
    headers.set("Authorization", `Bearer ${options.auth}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await safeJson(response)
    const message = errorBody?.message ?? response.statusText
    throw new Error(typeof message === "string" ? message : JSON.stringify(message))
  }

  return response.json() as Promise<T>
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
}

export const apiConfig = {
  baseUrl: API_URL,
}

