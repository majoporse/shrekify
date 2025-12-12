import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah M.",
    avatar: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    text: "I couldn't believe the transformation! My skin looks absolutely radiant. This app is magic! ✨",
  },
  {
    name: "Jessica L.",
    avatar: "https://i.pravatar.cc/100?img=5",
    rating: 5,
    text: "Finally an AI beauty app that delivers REAL results. My friends keep asking what my secret is!",
  },
  {
    name: "Emma K.",
    avatar: "https://i.pravatar.cc/100?img=9",
    rating: 5,
    text: "The glow is unreal! I've never looked better. Worth every penny! 💚",
  },
];

export function Testimonials() {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-center text-lg font-semibold text-emerald-700">
        💬 What Our Users Say
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial, idx) => (
          <Card
            key={idx}
            className="border-emerald-100 bg-white/80 backdrop-blur"
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-200"
                />
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                "{testimonial.text}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground/60">
        ⭐ 4.9 rating • 2M+ downloads • Featured in Vogue, Cosmo, Elle
      </p>
    </div>
  );
}
