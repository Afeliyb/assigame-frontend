"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const productId = searchParams.get("produit");

  const [interlocuteurId, setInterlocuteurId] = useState<string | null>(null);
  const [interlocuteur, setInterlocuteur] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // État pour stocker les informations du produit lié à la discussion
  const [productInfo, setProductInfo] = useState<{
    titre: string;
    prix?: number;
    image?: string;
  } | null>(null);

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
  // ============================================================
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
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
  // ── RECRÉATION SECURE : LECTURE DU CONTEXTE PRODUIT DEPUIS L'URL
  // ============================================================
  useEffect(() => {
    if (!productId) return;

    // Récupération directe et instantanée depuis les Query Params passés par ContactButtons
    const titre = searchParams.get("titre");
    const prixParam = searchParams.get("prix");
    const image = searchParams.get("image");

    if (titre) {
      setProductInfo({
        titre,
        prix: prixParam ? Number(prixParam) : undefined,
        image: image || undefined,
      });

      // Pré-remplit automatiquement la zone de saisie
      setInputValue(
        `Bonjour ! Je suis intéressé(e) par votre annonce "${titre}". Est-elle toujours disponible ?`,
      );
    }
  }, [productId, searchParams]);

  // ============================================================
  // SCROLL après chargement initial : forcer vers le bas
  // ============================================================
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // SHORT POLLING — 3 secondes
  // ============================================================
  useEffect(() => {
    if (!interlocuteurId || !user || isLoading) return;

    const intervalId = setInterval(async () => {
      try {
        const fresh = await fetchConversation(user.id, interlocuteurId);

        setMessages((prev) => {
          if (fresh.length === prev.length) {
            const lastFresh = fresh[fresh.length - 1];
            const lastPrev = prev[prev.length - 1];
            if (
              lastFresh?.id_message === lastPrev?.id_message &&
              lastFresh?.lu === lastPrev?.lu
            ) {
              return prev;
            }
          }
          return fresh;
        });

        if (fresh.length > prevMessageCountRef.current) {
          prevMessageCountRef.current = fresh.length;
          scrollToBottom();
        }
      } catch {
        // Silencieux
      }
    }, 3000);

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
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const sent = await envoyerMessage({
        idExpediteur: user.id,
        idDestinataire: interlocuteurId,
        contenu: content,
      });
      setMessages((prev) =>
        prev.map((m) => (m.id_message === optimisticId ? sent : m)),
      );
      prevMessageCountRef.current += 1;
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id_message !== optimisticId));
      setSendError(
        err instanceof ApiError ? err.message : "Échec de l'envoi. Réessayez.",
      );
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

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

      {/* ---- BANDEAU CONTEXTE PRODUIT ---- */}
      {productInfo && (
        <div className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            {productInfo.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productInfo.image}
                alt={productInfo.titre}
                className="w-11 h-11 object-cover rounded-xl border border-[var(--border-subtle)] shrink-0"
              />
            ) : (
              <div className="w-11 h-11 bg-[var(--background)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 opacity-40" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold text-black/40 dark:text-white/40 flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> Vous le contactez pour :
              </p>
              <h4 className="text-sm font-bold text-[var(--foreground)] truncate">
                {productInfo.titre}
              </h4>
              {productInfo.prix !== undefined && (
                <p className="text-xs font-semibold text-black/60 dark:text-white/60">
                  {productInfo.prix.toLocaleString("fr-FR")} FCFA
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setProductInfo(null)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)] transition-all shrink-0"
          >
            Masquer
          </button>
        </div>
      )}

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
              {showDateSeparator && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 uppercase tracking-wider">
                    {formatDateSeparator(msg.date_envoi)}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                </div>
              )}

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
                          `${msg.expediteur_prenom} ${msg.expediteur_nom}`,
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
