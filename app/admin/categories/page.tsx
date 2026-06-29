"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  adminFetchAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  type Category,
} from "@/lib/api/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [busyId, setBusyId]         = useState<number | null>(null);

  // Formulaire d'ajout
  const [newName, setNewName]   = useState("");
  const [newIcon, setNewIcon]   = useState("");
  const [adding, setAdding]     = useState(false);

  // Édition inline
  const [editId, setEditId]     = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  useEffect(() => {
    adminFetchAllCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const created = await adminCreateCategory({ name: newName.trim(), icon: newIcon.trim() || undefined });
      setCategories(prev => [...prev, created]);
      setNewName("");
      setNewIcon("");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon || "");
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = async (id: number) => {
  setBusyId(id);
  try {
    const current = categories.find(c => c.id === id);
    const updated = await adminUpdateCategory(id, {
      name: editName.trim(),
      icon: editIcon.trim() || undefined,
      description: current?.description, // preserve — backend écrase toujours ce champ
    });
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
      setEditId(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette catégorie ? Les produits qui l'utilisent risquent d'être affectés.")) return;
    setBusyId(id);
    try {
      await adminDeleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Impossible de supprimer : des produits utilisent probablement encore cette catégorie.");
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl">Catégories</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mt-1">
          {categories.length} catégories
        </p>
      </div>

      {/* Formulaire d'ajout */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row gap-2 mb-5 p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
      >
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nom de la catégorie (ex: Électronique)"
          className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--foreground)]"
        />
        <input
          value={newIcon}
          onChange={e => setNewIcon(e.target.value)}
          placeholder="Icône lucide (ex: Laptop)"
          className="sm:w-48 px-3 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--foreground)]"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="px-4 py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </form>

      {/* Liste */}
      <div className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/60">
              <th className="text-left p-3 font-bold text-[11px] text-black/40 dark:text-white/40 uppercase tracking-wider">Nom</th>
              <th className="text-left p-3 font-bold text-[11px] text-black/40 dark:text-white/40 uppercase tracking-wider hidden sm:table-cell">Icône</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => {
              const busy = busyId === c.id;
              const isEditing = editId === c.id;
              return (
                <tr
                  key={c.id}
                  className={`border-b border-[var(--border-subtle)] last:border-0 ${busy ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-sm outline-none"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-xs">{c.name}</span>
                    )}
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    {isEditing ? (
                      <input
                        value={editIcon}
                        onChange={e => setEditIcon(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-sm outline-none"
                      />
                    ) : (
                      <span className="text-xs text-black/50 dark:text-white/50">{c.icon || "—"}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(c.id)} className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 rounded-lg text-black/40 dark:text-white/40 hover:bg-[var(--surface-elevated)]">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg text-black/50 dark:text-white/50 hover:bg-[var(--surface-elevated)]">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-sm text-black/40 dark:text-white/40">
                  Aucune catégorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}