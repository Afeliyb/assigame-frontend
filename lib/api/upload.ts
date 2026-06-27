import { API_BASE_URL, ApiError } from "./config";

/**
 * Envoie un fichier image au backend (POST /api/upload, multipart/form-data) et retourne
 * l'URL publique à stocker ensuite dans Produit.images ou Utilisateur.avatar.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Impossible d'envoyer l'image. Vérifiez que le backend est démarré.",
      0,
    );
  }

  if (!response.ok) {
    let message = "Erreur lors de l'envoi de l'image.";
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore, on garde le message générique
    }
    throw new ApiError(message, response.status);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

/**
 * Envoie plusieurs images en parallèle et retourne leurs URLs dans le même ordre.
 * Si une image échoue, l'erreur est propagée (l'appelant peut alors avertir l'utilisateur).
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImage(file)));
}
