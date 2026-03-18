import { Bell, Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useStore } from "@/store/useStore";
import { useMemo } from "react";

export function TopBar() {
  const gateExamDate = useStore((s) => s.gateExamDate);
  const revisions = useStore((s) => s.revisions);
  const dpps = useStore((s) => s.dpps);

  const daysToGate = useMemo(() => {
    const now = new Date();
    const exam = new Date(gateExamDate);
    return Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, [gateExamDate]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric',
  });

  const overdueRevisions = revisions.filter(
    (r) => (r.status === 'pending' || r.status === 'snoozed') && r.scheduledDate < todayStr
  ).length;
  const overdueDPPs = dpps.filter((d) => d.status === 'pending' && d.date < todayStr).length;
  const overdueCount = overdueRevisions + overdueDPPs;

  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-surface/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-mono font-semibold">
          <span className="animate-pulse-glow">🎯</span>
          <span>{daysToGate} days to GATE</span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {overdueCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {overdueCount > 9 ? '9+' : overdueCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
