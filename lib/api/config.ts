// Configuration de base du client API vers le backend Spring Boot.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Wrapper autour de fetch qui ajoute l'URL de base, parse le JSON, et transforme les
 * réponses d'erreur du backend (qui renvoie soit une string, soit { message }) en ApiError
 * avec un message lisible pour l'utilisateur.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur Assigame. Vérifiez que le backend est démarré.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    let message = `Une erreur est survenue (${response.status}).`;
    if (typeof data === "string" && data) {
      message = data;
    } else if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message?: unknown }).message === "string"
    ) {
      message = (data as { message: string }).message;
    }
    throw new ApiError(message, response.status);
  }

  return data as T;
}
