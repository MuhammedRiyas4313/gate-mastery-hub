import { Calendar, Zap, Loader2, Clock } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function TopBar() {
  const { data, isLoading } = useDashboard();
  const location = useLocation();
  
  const todayFormatted = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  }), []);


  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-xl border-b border-primary/5 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-6">
        <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors h-10 w-10 rounded-xl hover:bg-primary/5" />
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-muted-foreground/60">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {isLoading ? (
            <div className="h-9 w-24 md:w-40 bg-secondary/30 animate-pulse rounded-full" />
        ) : (
            <div className="flex items-center gap-2 md:gap-3 bg-primary/10 border border-primary/10 px-3 md:px-5 py-2 rounded-full shadow-sm hover:shadow-primary/5 transition-all group cursor-help">
              <span className="text-xs md:text-sm group-hover:scale-125 transition-transform duration-500">🎯</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em] md:tracking-[0.15em]">
                <span className="hidden sm:inline">{data?.upcomingExams?.[0]?.title || "GATE"}: </span>
                {data?.gateCountdownDays || 0}d
              </span>
            </div>
        )}

        <div className="flex items-center gap-1.5 ml-2">
            <Link 
                to="/timer"
                className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${
                  location.pathname === '/timer' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
                title="Module Timer"
            >
                <Clock className={`h-5 w-5 ${location.pathname === '/timer' ? 'fill-current' : ''}`} />
            </Link>
        </div>
      </div>
    </header>
  );
}
