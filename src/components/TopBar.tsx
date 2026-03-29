import { Calendar, Zap, Loader2, Clock } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboard } from "@/hooks/useDashboard";
import { useStore } from "@/store/useStore";
import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export function TopBar() {
  const { data, isLoading } = useDashboard();
  const location = useLocation();
  const activeTimer = useStore(state => state.activeTimer);
  const [activeSeconds, setActiveSeconds] = useState(0);
  
  const todayFormatted = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  }), []);

  // Sync with active timer
  useEffect(() => {
    if (!activeTimer) return;
    
    const update = () => {
      const start = new Date(activeTimer.startTime).getTime();
      const now = Date.now();
      setActiveSeconds(Math.floor((now - start) / 1000));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);


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

        <div className="flex items-center gap-1.5 ml-2 relative">
            <Link 
                to="/timer"
                className={`h-10 px-3 flex items-center justify-center gap-2 rounded-xl transition-all ${
                  location.pathname === '/timer' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
                title="Module Timer"
            >
                <div className="relative">
                  <Clock className={`h-5 w-5 ${location.pathname === '/timer' ? 'fill-current' : ''}`} />
                  {activeTimer && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </div>
                {activeTimer && (
                  <span className="font-mono text-xs font-black tracking-tighter min-w-[54px]">
                    {formatTime(activeSeconds)}
                  </span>
                )}
            </Link>
        </div>
      </div>
    </header>
  );
}

const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
