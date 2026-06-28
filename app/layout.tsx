import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

import { ThemeProvider }     from "@/components/theme-provider";
import { CursorProvider }    from "@/components/cursor-provider";
import { AuthProvider }      from "@/components/auth-provider";
import { CategoriesProvider } from "@/components/categories-provider";
import { ListingsProvider }  from "@/components/listings-provider";
import { FavoritesProvider } from "@/components/favorites-provider";
import { LanguageProvider }  from "@/components/language-provider";
import { LocationProvider }  from "@/components/location-provider";
import { Navbar }            from "@/components/navbar";
import { Footer }            from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Assigame | Le marketplace premium du Togo",
  description:
    "Assigame — Acheter, vendre et négocier des articles de seconde main à Lomé et partout au Togo. Marketplace C2C togolais.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black"
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system" storageKey="assigame-theme">
          <LanguageProvider>
            <LocationProvider>
              <AuthProvider>
                <CategoriesProvider>
                  <ListingsProvider>
                    <FavoritesProvider>
                      <CursorProvider>
                        <Navbar />
                        <main className="flex-1 flex flex-col relative">
                          {children}
                        </main>
                        <Footer />
                      </CursorProvider>
                    </FavoritesProvider>
                  </ListingsProvider>
                </CategoriesProvider>
              </AuthProvider>
            </LocationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
