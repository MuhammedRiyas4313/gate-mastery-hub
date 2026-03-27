import { Zap } from "lucide-react";

export function Logo({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 overflow-hidden group"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-white/20 animate-pulse group-hover:animate-none" />
        <Zap className="relative z-10 text-primary-foreground" size={size * 0.6} strokeWidth={3} />
        <div className="absolute -bottom-1 -right-1 w-1/2 h-1/2 bg-white/20 blur-sm rounded-full" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-heading font-black text-foreground tracking-tighter" style={{ fontSize: size * 0.7 }}>GATE</span>
        <span className="font-heading font-black text-primary tracking-widest uppercase opacity-80" style={{ fontSize: size * 0.3 }}>Mastery</span>
      </div>
    </div>
  );
}

export function Favicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="10" fill="hsl(263.4, 70%, 50.4%)"/>
      <path d="M16 7L23 14H19V25H13V14H9L16 7Z" fill="white"/>
      <circle cx="16" cy="16" r="14" stroke="white" strokeOpacity="0.1" strokeWidth="4"/>
    </svg>
  );
}
