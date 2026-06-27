"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const { login, register } = useAuth();
  const router = useRouter();

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = isLogin
      ? await login(email, password)
      : await register({
          firstName,
          lastName,
          email,
          password,
          phone: phone || undefined,
          whatsapp: phone || undefined,
          location: location || undefined,
        });

    setIsSubmitting(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Une erreur est survenue. Réessayez.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden pt-16">
      {/* Decorative bg */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-black/5 to-transparent dark:from-white/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[var(--glass)] backdrop-blur-3xl border border-[var(--border-subtle)] rounded-4xl p-8 md:p-12 shadow-[var(--shadow-elegant)] relative z-10 my-8"
      >
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo className="w-10 h-10" />
          </Link>
        </div>

        <h1 className="font-display font-black text-3xl text-center mb-8 tracking-tight">
          {isLogin ? "Bon retour." : "Rejoignez l'élite."}
        </h1>

        <div className="flex bg-[var(--surface-elevated)] p-1 rounded-full mb-8">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${isLogin ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"}`}
            onClick={() => switchMode(true)}
          >
            Connexion
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-colors ${!isLogin ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"}`}
            onClick={() => switchMode(false)}
          >
            Inscription
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Prénom"
                    required={!isLogin}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    required={!isLogin}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Téléphone / WhatsApp (ex: +22890000000)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
                />
                <input
                  type="text"
                  placeholder="Quartier, ville (ex: Adidogomé, Lomé)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Adresse email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            required
            minLength={isLogin ? undefined : 6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-transparent focus:border-[var(--border-subtle)] outline-none font-medium"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-4 bg-[var(--foreground)] text-[var(--background)] rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Se connecter" : "Créer mon compte"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
