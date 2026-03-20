import { Bell, Calendar, LogOut, Loader2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { data, isLoading } = useDashboard();
  const { logout } = useAuth();
  
  const todayFormatted = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  }), []);

  const overdueCount = useMemo(() => {
    if (!data) return 0;
    const overdueRevs = data.revisionsToday?.filter((r: any) => r.status === 'PENDING' || r.status === 'SNOOZED').length || 0;
    const dppPending = data.todayDPP?.status === 'PENDING' ? 1 : 0;
    return overdueRevs + dppPending;
  }, [data]);

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl border-b border-primary/5 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors h-10 w-10 rounded-xl hover:bg-primary/5" />
        <div className="hidden md:flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-muted-foreground/60">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
            <div className="h-9 w-32 bg-secondary/30 animate-pulse rounded-full" />
        ) : (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/10 px-5 py-2 rounded-full shadow-sm hover:shadow-primary/5 transition-all group">
              <span className="text-sm group-hover:scale-125 transition-transform duration-500">🎯</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">{data?.gateCountdownDays || 0} days to GATE</span>
            </div>
        )}

        <div className="flex items-center gap-1.5 ml-2">
            <button className="relative p-2.5 rounded-xl hover:bg-secondary transition-all group">
              <Bell className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary" />
              {overdueCount > 0 && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-background">
                  {overdueCount}
                </span>
              )}
            </button>
            <div className="w-px h-6 bg-primary/5 mx-2" />
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
            >
                <LogOut className="h-4.5 w-4.5" />
            </Button>
        </div>
      </div>
    </header>
  );
}
