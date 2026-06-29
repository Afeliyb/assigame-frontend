"use client";

// app/admin/users/page.tsx
// Liste de tous les utilisateurs avec recherche et suppression.
// La suppression est bloquée pour les comptes admin (isAdmin === true).

import React, { useEffect, useState, useMemo } from "react";
import { Search, Trash2, ShieldCheck } from "lucide-react";
import { adminFetchAllUtilisateurs, adminDeleteUtilisateur } from "@/lib/api/admin";
import { getAvatarUrl } from "@/lib/utils";
import type { AuthUser } from "@/lib/types";

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [busyId,  setBusyId]  = useState<string | null>(null);

  useEffect(() => {
    adminFetchAllUtilisateurs()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.location ?? "").toLowerCase().includes(q) ||
      (u.role ?? "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    setBusyId(id);
    try {
      await adminDeleteUtilisateur(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const adminCount = users.filter(u => u.isAdmin).length;

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">Utilisateurs</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">
          {users.length} membres · {adminCount} admin{adminCount > 1 ? "s" : ""}
        </p>
      </div>

      {/* Recherche */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, ville…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--foreground)] transition-colors"
        />
      </div>

      {/* Tableau */}
      <div className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
                {["Utilisateur", "Email", "Ville", "Rôle", ""].map(h => (
                  <th
                    key={h}
                    className={`text-left p-3 font-bold text-[11px] text-black/40 dark:text-white/40 uppercase tracking-wider ${
                      h === "Email" ? "hidden sm:table-cell" :
                      h === "Ville" ? "hidden md:table-cell" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const busy = busyId === u.id;
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-elevated)]/40 transition-colors ${busy ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {/* Avatar + nom */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatar || getAvatarUrl(u.name)}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-xs truncate">{u.name}</p>
                            {u.isAdmin && (
                              <ShieldCheck className="w-3 h-3 text-orange-500 shrink-0" />
                            )}
                          </div>
                          {/* Email visible sur mobile sous le nom */}
                          <p className="text-[10px] text-black/40 dark:text-white/40 truncate sm:hidden">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-3 hidden sm:table-cell">
                      <span className="text-xs text-black/60 dark:text-white/60">{u.email}</span>
                    </td>

                    {/* Ville */}
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-xs text-black/60 dark:text-white/60">
                        {u.location || "—"}
                      </span>
                    </td>

                    {/* Rôle */}
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.isAdmin
                          ? "bg-orange-500/15 text-orange-600"
                          : "bg-[var(--surface-elevated)] text-black/50 dark:text-white/50"
                      }`}>
                        {u.role || "Utilisateur"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={busy || !!u.isAdmin}
                          title={u.isAdmin ? "Impossible de supprimer un administrateur" : "Supprimer"}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm text-black/40 dark:text-white/40">
                    Aucun utilisateur correspondant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}