"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { Reveal } from "@/components/animated-text";
import { useAuth } from "@/components/auth-provider";
import { fetchInbox } from "@/lib/api/messages";
import type { ConversationSummary } from "@/lib/types";
import { getAvatarUrl } from "@/lib/utils";

/** Formate une date ISO en texte relatif humain (ex: "Il y a 2 heures") */
function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Hier";
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return date.toLocaleDateString("fr-FR");
}

export default function MessagesInboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    fetchInbox(user.id)
      .then((data) => { if (!cancelled) setConversations(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [user]);

  const totalNonLus = conversations.reduce((sum, c) => sum + c.non_lus, 0);

  return (
    <div className="max-w-3xl">
      <Reveal>
        <div className="flex items-end gap-3 mb-2">
          <h1 className="font-display font-black text-4xl">Messages</h1>
          {totalNonLus > 0 && (
            <span className="mb-1.5 px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-full">
              {totalNonLus} non lu{totalNonLus > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-black/60 dark:text-white/60 mb-8">
          Vos échanges avec les autres membres d&apos;Assigame.
        </p>

        {isLoading && (
          <div className="flex justify-center p-16">
            <Loader2 className="w-7 h-7 animate-spin opacity-50" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 p-5 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center">
              <MessageSquare className="w-7 h-7 opacity-30" />
            </div>
            <div>
              <p className="font-bold text-lg mb-1">Aucun message pour l&apos;instant</p>
              <p className="text-sm text-black/60 dark:text-white/60 max-w-xs mx-auto">
                Contactez un vendeur depuis la fiche d&apos;un produit pour démarrer une conversation.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && conversations.length > 0 && (
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => {
              const avatarSrc =
                conv.interlocuteur_avatar ||
                getAvatarUrl(`${conv.interlocuteur_prenom} ${conv.interlocuteur_nom}`);
              const hasUnread = conv.non_lus > 0;

              return (
                <Link
                  key={conv.interlocuteur_id}
                  href={`/dashboard/messages/${conv.interlocuteur_id}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
                    hasUnread
                      ? "bg-[var(--surface-elevated)] border-[var(--border-subtle)]"
                      : "bg-transparent border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarSrc}
                        alt={`${conv.interlocuteur_prenom} ${conv.interlocuteur_nom}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                        {conv.non_lus}
                      </span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-bold text-sm ${hasUnread ? "text-[var(--fg)]" : "text-[var(--fg)]"}`}>
                        {conv.interlocuteur_prenom} {conv.interlocuteur_nom}
                      </span>
                      <span className="text-xs text-black/40 dark:text-white/40 shrink-0 ml-2">
                        {formatRelative(conv.date_dernier_message)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        hasUnread
                          ? "text-black dark:text-white font-semibold"
                          : "text-black/50 dark:text-white/50"
                      }`}
                    >
                      {conv.dernier_message}
                    </p>
                    {/* Produit référencé */}
                    {conv.produit_ref_nom && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {conv.produit_ref_image && (
                          <div className="relative w-5 h-5 rounded overflow-hidden shrink-0">
                            <Image
                              src={conv.produit_ref_image}
                              alt={conv.produit_ref_nom}
                              fill
                              sizes="20px"
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <span className="text-[10px] font-semibold text-black/40 dark:text-white/40 truncate">
                          {conv.produit_ref_nom}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Reveal>
    </div>
  );
}
