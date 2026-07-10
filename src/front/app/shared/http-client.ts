const API_BASE_URL = `http://localhost:3000`;

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    if (typeof body === "object" && body !== null && "error" in body) {
      const { error } = body as { error: unknown };
      if (typeof error === "string") {
        return error;
      }
    }
  } catch {
    /* response body is not JSON */
  }
  return response.statusText;
};

export async function get<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${await readErrorMessage(response)}`);
  }
  return response.json();
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.status} ${await readErrorMessage(response)}`);
  }
  return response.json();
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
  if (!response.ok) {
    throw new Error(`PUT ${url} failed: ${response.status} ${await readErrorMessage(response)}`);
  }
  return response.json();
}
