import { Sparkles, Star, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <div className="text-center mb-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
      >
        <Sparkles className="w-8 h-8 text-emerald-400" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent tracking-tight leading-normal pb-1">
          Glow Up
        </h1>
        <Sparkles className="w-8 h-8 text-emerald-400" />
      </Link>
      <p className="text-muted-foreground mb-2">
        Reveal Your <span className="text-emerald-600 font-semibold">AI</span>
        nner Beauty
      </p>
      <nav className="flex justify-center gap-4 mt-4">
        <Link
          to="/"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium",
            location.pathname === "/"
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
              : "bg-white/60 hover:bg-white/90 text-emerald-700 border border-emerald-200"
          )}
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/transformations"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-medium",
            location.pathname.startsWith("/transformations")
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
              : "bg-white/60 hover:bg-white/90 text-emerald-700 border border-emerald-200"
          )}
        >
          <Star className="w-4 h-4" />
          Transformations
        </Link>
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <div className="text-center mt-12 space-y-2">
      <p className="text-sm text-muted-foreground">
        Trusted by millions worldwide 🌟
      </p>
      <p className="text-xs text-muted-foreground/60">
        "The results were... transformative" - Beauty Weekly
      </p>
      <p className="text-xs text-muted-foreground/40">
        © 2024 Glow Up Inc. All rights reserved.
      </p>
    </div>
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
