import { Sparkles, Image, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 mb-2">
        <Sparkles className="w-8 h-8 text-emerald-500" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
          Shrekify
        </h1>
        <Sparkles className="w-8 h-8 text-emerald-500" />
      </div>
      <p className="text-muted-foreground mb-4">
        Transform your photos with AI-powered ogre magic
      </p>
      <nav className="flex justify-center gap-4">
        <Link
          to="/"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            location.pathname === "/"
              ? "bg-emerald-500 text-white"
              : "bg-white/50 hover:bg-white/80 text-emerald-700"
          )}
        >
          <Home className="w-4 h-4" />
          Create
        </Link>
        <Link
          to="/gallery"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            location.pathname.startsWith("/gallery")
              ? "bg-emerald-500 text-white"
              : "bg-white/50 hover:bg-white/80 text-emerald-700"
          )}
        >
          <Image className="w-4 h-4" />
          Gallery
        </Link>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <p className="text-center text-sm text-muted-foreground mt-8">
      Powered by Stable Diffusion with IP-Adapter
    </p>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
