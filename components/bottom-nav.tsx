"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { fetchNonLus } from "@/lib/api/messages";

const GUEST_LINKS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/browse", label: "Parcourir", icon: Search },
  { href: "/auth", label: "Vendre", icon: Plus },
  { href: "/auth", label: "Messages", icon: MessageSquare },
  { href: "/auth", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    fetchNonLus(user.id).then(setUnread).catch(() => {});
    const id = setInterval(() => {
      fetchNonLus(user.id).then(setUnread).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [user]);

  // Masquée sur les pages qui ont déjà leur propre bottom nav (dashboard, admin)
  if (pathname.startsWith("/admin")) {
  return null;
}
  const LINKS = user
    ? [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/browse", label: "Parcourir", icon: Search },
        { href: "/dashboard/new", label: "Vendre", icon: Plus },
        { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, badge: unread },
        { href: "/dashboard", label: "Profil", icon: User },
      ]
    : GUEST_LINKS;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)] flex items-stretch">
      {LINKS.map(({ href, label, icon: Icon, badge }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const isCenter = label === "Vendre";

        if (isCenter) {
          return (
            <Link
              key={label}
              href={href}
              className="flex-1 flex items-center justify-center py-2"
              aria-label={label}
            >
              <span className="w-11 h-11 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-md active:scale-90 transition-transform">
                <Icon className="w-5 h-5" />
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={label}
            href={href}
            aria-label={label}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] transition-colors ${
              isActive ? "text-[var(--foreground)]" : "text-black/40 dark:text-white/40"
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
            <span className="text-[9px] font-bold leading-none">{label}</span>
            {!!badge && badge > 0 && (
              <span className="absolute top-1 right-[22%] w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[var(--foreground)] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}