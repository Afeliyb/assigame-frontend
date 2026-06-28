"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Reveal } from "@/components/animated-text";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { uploadImage } from "@/lib/api/upload";
import { updateUtilisateur } from "@/lib/api/utilisateurs";
import { ApiError } from "@/lib/api/config";
import { getAvatarUrl } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || user?.whatsapp || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setAvatar(url);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Échec de l'envoi de la photo.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (showPasswordFields && newPassword) {
      if (newPassword.length < 6) {
        setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }
    }

    setIsSaving(true);

    const result = await updateUser({
      firstName,
      lastName,
      phone,
      whatsapp: phone,
      location,
      bio,
      avatar,
    });

    if (!result.success) {
      setError(result.error ?? "Mise à jour impossible. Réessayez.");
      setIsSaving(false);
      return;
    }

    if (showPasswordFields && newPassword) {
      try {
        await updateUtilisateur(user.id, { motdepasse: newPassword });
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordFields(false);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Le profil a été mis à jour, mais le changement de mot de passe a échoué.",
        );
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <Reveal>
        <h1 className="font-display font-black text-4xl mb-2">Mon Profil</h1>
        <p className="text-black/60 dark:text-white/60 mb-10">
          Gérez vos informations personnelles.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface-elevated)] p-8 rounded-4xl flex flex-col gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--background)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar || getAvatarUrl(`${firstName} ${lastName}`)}
                alt={user.name}
                className="w-full h-full object-cover"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <label className="px-4 py-2 bg-[var(--background)] border border-[var(--border-subtle)] rounded-full text-sm font-bold shadow-sm hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Prénom</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Nom</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Adresse email
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent outline-none font-medium text-black/60 dark:text-white/60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Téléphone / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+22890000000"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
            />
            <p className="text-xs text-black/40 dark:text-white/40 mt-1.5">
              Utilisé pour le bouton &quot;Contacter le vendeur&quot; sur vos annonces.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Localisation (Togo)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ex: Adidogomé, Lomé"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Bio (visible sur votre profil public)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Présentez-vous en quelques mots..."
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium resize-none"
            />
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setShowPasswordFields((v) => !v)}
              className="text-sm font-bold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors pt-4"
            >
              {showPasswordFields
                ? "Annuler le changement de mot de passe"
                : "Changer mon mot de passe"}
            </button>

            <AnimatePresence>
              {showPasswordFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 overflow-hidden"
                >
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--background)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profil mis à jour avec succès.
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] mt-4">
            <button
              type="submit"
              disabled={isSaving || isUploadingAvatar}
              className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-[var(--shadow-elegant)] disabled:opacity-60 disabled:hover:scale-100 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}
