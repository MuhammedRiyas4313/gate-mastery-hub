import { Zap } from "lucide-react";

export function Logo({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark — electric glow ring */}
      <div
        className="relative flex items-center justify-center rounded-xl overflow-hidden shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 bg-primary opacity-20 blur-sm rounded-xl" />
        {/* Icon background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl border border-primary/40" />
        <Zap
          className="relative z-10 text-primary drop-shadow-[0_0_6px_hsl(330,81%,60%)]"
          size={size * 0.58}
          strokeWidth={2.5}
          fill="currentColor"
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className="font-heading font-black text-foreground tracking-tight"
          style={{ fontSize: size * 0.72, letterSpacing: "-0.02em" }}
        >
          GO
          <span className="text-primary">-T</span>
        </span>
        <span
          className="font-heading font-bold text-primary/60 uppercase tracking-[0.18em]"
          style={{ fontSize: size * 0.28 }}
        >
          Gate Prep
        </span>
      </div>
    </div>
  );
}

export function Favicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="10" fill="hsl(200, 30%, 6%)"/>
      {/* Electric glow ring */}
      <circle cx="16" cy="16" r="13" stroke="#ec4899" strokeOpacity="0.3" strokeWidth="1.5"/>
      {/* Zap */}
      <path d="M18 5L10 17h6l-2 10 10-14h-6l2-8z" fill="#ec4899"/>
      {/* Inner glow */}
      <circle cx="16" cy="16" r="7" fill="#ec4899" fillOpacity="0.08"/>
    </svg>
  );
}
