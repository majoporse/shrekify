import { Link } from "react-router-dom";
import { Sparkles, Star, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Testimonials } from "@/components/Testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-emerald-400" />
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent tracking-tight leading-normal pb-1">
              Glow Up
            </h1>
            <Sparkles className="w-12 h-12 text-emerald-400" />
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-4">
            Reveal Your <span className="text-emerald-600 font-bold">AI</span>
            nner Beauty
          </p>

          {/* Sub-tagline */}
          <p className="text-lg text-muted-foreground mb-8">
            ✨ The #1 AI-powered beauty enhancement app ✨
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/transformations">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Star className="w-5 h-5 mr-2" />
                View Transformations
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                Advanced neural networks analyze and enhance your natural beauty
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Natural Results</h3>
              <p className="text-sm text-muted-foreground">
                Subtle, believable enhancements that look completely natural
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-2xl p-6 border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Glow</h3>
              <p className="text-sm text-muted-foreground">
                See your transformation in seconds with our fast processing
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mb-12 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                2M+
              </p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                4.9
              </p>
              <p className="text-sm text-muted-foreground">App Rating</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                50M+
              </p>
              <p className="text-sm text-muted-foreground">Transformations</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <Testimonials />
        </div>

        {/* Footer */}
        <div className="text-center mt-16 space-y-2">
          <p className="text-sm text-muted-foreground">
            As featured in Vogue, Cosmopolitan, Elle, and Beauty Weekly 🌟
          </p>
          <p className="text-xs text-muted-foreground/60">
            "The results were... transformative" - Beauty Weekly
          </p>
          <p className="text-xs text-muted-foreground/40 mt-4">
            © 2024 Glow Up Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
