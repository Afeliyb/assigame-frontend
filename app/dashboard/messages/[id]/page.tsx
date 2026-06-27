"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Send,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { fetchConversation, envoyerMessage } from "@/lib/api/messages";
import { fetchSellerById } from "@/lib/api/utilisateurs";
import { ApiError } from "@/lib/api/config";
import type { Message } from "@/lib/types";
import type { Seller } from "@/lib/types";
import { getAvatarUrl } from "@/lib/utils";

// ============================================================
// HELPERS DE FORMATAGE
// ============================================================

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const [interlocuteurId, setInterlocuteurId] = useState<string | null>(null);
  const [interlocuteur, setInterlocuteur] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Référence vers le bas de la liste pour le scroll automatique
  const bottomRef = useRef<HTMLDivElement>(null);
  // Référence vers le conteneur scrollable pour détecter si l'utilisateur fait défiler
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Indique si l'utilisateur est actuellement proche du bas (pour décider de scroller automatiquement)
  const isNearBottomRef = useRef(true);
  // Garde une trace du nombre de messages pour détecter les nouveaux messages du polling
  const prevMessageCountRef = useRef(0);

  // ============================================================
  // RÉSOLUTION DE L'ID depuis les params Next.js 15 (async)
  // ============================================================
  useEffect(() => {
    params.then((p) => setInterlocuteurId(p.id));
  }, [params]);

  // ============================================================
  // SCROLL : détecter si l'utilisateur est proche du bas
  // On ne fait défiler automatiquement que dans ce cas, pour
  // ne pas l'interrompre s'il remonte lire d'anciens messages.
  // ============================================================
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // "Proche du bas" = moins de 80px au-dessus du bas
    isNearBottomRef.current = distanceFromBottom < 80;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // ============================================================
  // CHARGEMENT INITIAL : profil interlocuteur + messages
  // ============================================================
  useEffect(() => {
    if (!interlocuteurId || !user) return;
    let cancelled = false;

    Promise.all([
      fetchSellerById(interlocuteurId),
      fetchConversation(user.id, interlocuteurId),
    ])
      .then(([seller, msgs]) => {
        if (cancelled) return;
        setInterlocuteur(seller);
        setMessages(msgs);
        prevMessageCountRef.current = msgs.length;
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [interlocuteurId, user]);

  // ============================================================
  // SCROLL après chargement initial : forcer vers le bas
  // ============================================================
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // On force le scroll vers le bas à l'ouverture de la conversation
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // SHORT POLLING — 3 secondes
  // Recharge silencieusement les messages en arrière-plan.
  // Ne redémarre qu'après la fin du chargement initial.
  // Le clearInterval au démontage évite les fuites mémoire.
  // ============================================================
  useEffect(() => {
    if (!interlocuteurId || !user || isLoading) return;

    const intervalId = setInterval(async () => {
      try {
        const fresh = await fetchConversation(user.id, interlocuteurId);

        setMessages((prev) => {
          // Optimisation : ne met à jour l'état que si les données ont vraiment changé
          // (évite un re-render inutile toutes les 3s quand il n'y a pas de nouveaux messages)
          if (fresh.length === prev.length) {
            // Même nombre de messages → on vérifie le contenu du dernier
            const lastFresh = fresh[fresh.length - 1];
            const lastPrev = prev[prev.length - 1];
            if (
              lastFresh?.id_message === lastPrev?.id_message &&
              lastFresh?.lu === lastPrev?.lu
            ) {
              return prev; // Aucun changement → React ne re-render pas
            }
          }
          return fresh;
        });

        // Scroll automatique si de nouveaux messages sont arrivés et l'utilisateur est en bas
        if (fresh.length > prevMessageCountRef.current) {
          prevMessageCountRef.current = fresh.length;
          scrollToBottom(); // Respecte la position de l'utilisateur (scrolle seulement s'il est en bas)
        }
      } catch {
        // Silencieux : un échec de polling ne doit pas casser l'interface
        // La prochaine tentative aura lieu dans 3 secondes
      }
    }, 3000); // ← 3 secondes

    // NETTOYAGE : clearInterval est appelé quand le composant est démonté
    // ou quand l'une des dépendances change (ex: changement de conversation).
    // Sans ce cleanup, l'intervalle continuerait à tourner en arrière-plan
    // même après que l'utilisateur ait quitté la page (fuite mémoire).
    return () => clearInterval(intervalId);
  }, [interlocuteurId, user, isLoading, scrollToBottom]);

  // ============================================================
  // ENVOI D'UN MESSAGE
  // ============================================================
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = inputValue.trim();
    if (!content || !user || !interlocuteurId || isSending) return;

    setSendError(null);
    setIsSending(true);

    // Optimistic update : on ajoute le message localement immédiatement
    // pour que l'utilisateur ne ressente pas la latence réseau.
    const optimisticId = Date.now();
    const optimistic: Message = {
      id_message: optimisticId,
      contenu: content,
      date_envoi: new Date().toISOString(),
      lu: false,
      expediteur_id: Number(user.id),
      expediteur_nom: user.lastName,
      expediteur_prenom: user.firstName,
      expediteur_avatar: user.avatar,
      destinataire_id: Number(interlocuteurId),
      destinataire_nom: interlocuteur?.name.split(" ")[1] || "",
      destinataire_prenom: interlocuteur?.name.split(" ")[0] || "",
    };

    setMessages((prev) => [...prev, optimistic]);
    setInputValue("");
    // On force le scroll vers le bas quand on envoie un message
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const sent = await envoyerMessage({
        idExpediteur: user.id,
        idDestinataire: interlocuteurId,
        contenu: content,
      });
      // On remplace le message optimiste par le vrai (avec l'ID serveur définitif)
      setMessages((prev) =>
        prev.map((m) => (m.id_message === optimisticId ? sent : m))
      );
      prevMessageCountRef.current += 1;
    } catch (err) {
      // Échec : on retire le message optimiste et on restaure le texte
      setMessages((prev) => prev.filter((m) => m.id_message !== optimisticId));
      setSendError(
        err instanceof ApiError ? err.message : "Échec de l'envoi. Réessayez."
      );
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Entrée ou Cmd+Entrée → envoyer. Entrée seul → saut de ligne.
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl">
      {/* ---- EN-TÊTE ---- */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--background)] shrink-0">
        <Link
          href="/dashboard/messages"
          className="p-2 rounded-full hover:bg-[var(--surface-elevated)] transition-colors text-black/60 dark:text-white/60"
          aria-label="Retour aux messages"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {isLoading ? (
          <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] animate-pulse" />
        ) : interlocuteur ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={interlocuteur.avatar || getAvatarUrl(interlocuteur.name)}
              alt={interlocuteur.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{interlocuteur.name}</p>
              <p className="text-xs text-black/50 dark:text-white/50 truncate">
                {interlocuteur.location}
              </p>
            </div>
            <Link
              href={`/seller/${interlocuteurId}`}
              className="text-xs font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
            >
              Voir le profil →
            </Link>
          </>
        ) : null}
      </div>

      {/* ---- CORPS — liste des bulles ---- */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-1"
      >
        {isLoading && (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin opacity-50" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-black/40 dark:text-white/40">
            <p className="font-semibold">Aucun message pour le moment.</p>
            <p className="text-sm">
              Envoyez un premier message pour démarrer la conversation.
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.expediteur_id === Number(user.id);
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showDateSeparator =
            !prevMsg || !isSameDay(msg.date_envoi, prevMsg.date_envoi);

          return (
            <React.Fragment key={msg.id_message}>
              {/* Séparateur de date */}
              {showDateSeparator && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                    {formatDateSeparator(msg.date_envoi)}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                </div>
              )}

              {/* Contexte produit (première fois qu'un produit apparaît) */}
              {msg.produit_ref_id && !prevMsg?.produit_ref_id && (
                <Link
                  href={`/product/${msg.produit_ref_id}`}
                  className="flex items-center gap-2.5 p-2.5 my-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors self-center max-w-xs"
                >
                  {msg.produit_ref_image && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={msg.produit_ref_image}
                        alt={msg.produit_ref_nom || ""}
                        fill
                        sizes="40px"
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/40">
                      <ShoppingBag className="w-2.5 h-2.5" />
                      Article concerné
                    </div>
                    <p className="text-xs font-semibold truncate">
                      {msg.produit_ref_nom}
                    </p>
                  </div>
                </Link>
              )}

              {/* Bulle de message */}
              <div
                className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isOwn && (
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mb-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        msg.expediteur_avatar ||
                        getAvatarUrl(
                          `${msg.expediteur_prenom} ${msg.expediteur_nom}`
                        )
                      }
                      alt={msg.expediteur_prenom}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[75%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      isOwn
                        ? "bg-[var(--foreground)] text-[var(--background)] rounded-br-sm"
                        : "bg-[var(--surface-elevated)] text-[var(--foreground)] rounded-bl-sm"
                    }`}
                  >
                    {msg.contenu}
                  </div>
                  <span className="text-[10px] text-black/30 dark:text-white/30 mt-1 px-1">
                    {formatTime(msg.date_envoi)}
                    {isOwn && (
                      <span className="ml-1">{msg.lu ? " ✓✓" : " ✓"}</span>
                    )}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Ancre invisible pour scrollToBottom */}
        <div ref={bottomRef} />
      </div>

      {/* ---- ZONE DE SAISIE ---- */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--background)] p-3">
        {sendError && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {sendError}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message… (Ctrl+Entrée pour envoyer)"
            rows={1}
            className="flex-1 resize-none px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] outline-none text-sm font-medium transition-colors"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="p-3 bg-[var(--foreground)] text-[var(--background)] rounded-full disabled:opacity-40 hover:opacity-90 transition-all active:scale-95 shrink-0"
            aria-label="Envoyer"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-black/25 dark:text-white/25 mt-2">
          Ctrl+Entrée pour envoyer · Entrée pour sauter une ligne
        </p>
      </div>
    </div>
  );
}
