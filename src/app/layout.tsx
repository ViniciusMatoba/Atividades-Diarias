import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/lib/firebase/AuthProvider";

export const metadata: Metadata = {
  title: "GeekDaily — microgames diários",
  description: "5 microgames de cultura geek todo dia. Mapas, Pokémon, anime, filmes e games.",
};

export const viewport: Viewport = {
  themeColor: "#0f1120",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-20">
            <main className="flex-1 px-4 pt-5">{children}</main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
