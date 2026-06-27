import { apiFetch } from "./config";
import type { ConversationSummary, Message } from "@/lib/types";

/** Récupère la boîte de réception : liste des conversations avec résumés */
export async function fetchInbox(userId: string): Promise<ConversationSummary[]> {
  return apiFetch<ConversationSummary[]>(`/message/inbox?userId=${userId}`);
}

/**
 * Récupère l'historique complet d'une conversation avec un interlocuteur.
 * Le backend marque automatiquement les messages reçus comme "lus" lors de cet appel.
 */
export async function fetchConversation(
  userId: string,
  interlocuteurId: string,
): Promise<Message[]> {
  return apiFetch<Message[]>(
    `/message/conversation/${interlocuteurId}?userId=${userId}`,
  );
}

/**
 * Envoie un message.
 * @param idProduitRef - ID du produit concerné (optionnel)
 */
export async function envoyerMessage(params: {
  idExpediteur: string;
  idDestinataire: string;
  contenu: string;
  idProduitRef?: string;
}): Promise<Message> {
  return apiFetch<Message>("/message/envoyer", {
    method: "POST",
    body: JSON.stringify({
      idExpediteur: Number(params.idExpediteur),
      idDestinataire: Number(params.idDestinataire),
      contenu: params.contenu,
      idProduitRef: params.idProduitRef ? Number(params.idProduitRef) : null,
    }),
  });
}

/** Nombre total de messages non lus (pour le badge navbar) */
export async function fetchNonLus(userId: string): Promise<number> {
  const data = await apiFetch<{ count: number }>(
    `/message/non-lus?userId=${userId}`,
  );
  return data.count;
}
