import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 mb-2">
        <Sparkles className="w-8 h-8 text-emerald-500" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
          Shrekify
        </h1>
        <Sparkles className="w-8 h-8 text-emerald-500" />
      </div>
      <p className="text-muted-foreground">
        Transform your photos with AI-powered ogre magic
      </p>
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
