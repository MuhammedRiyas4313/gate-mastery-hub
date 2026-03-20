import { useRevisions } from "@/hooks/useRevisions";
import { useMemo } from "react";
import { RefreshCw, Clock, CheckCircle2, AlarmClock, SkipForward, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const todayStr = () => new Date().toISOString().split('T')[0];

export default function Revision() {
  const { data: revisions, isLoading, updateStatus } = useRevisions();
  const tStr = todayStr();

  const categories = useMemo(() => {
    if (!revisions) return { dueToday: [], overdue: [], upcoming: [], completed: [] };
    
    return {
      dueToday: revisions.filter((r: any) => (r.status === 'PENDING' || r.status === 'SNOOZED') && r.scheduledDate.split('T')[0] === tStr),
      overdue: revisions.filter((r: any) => (r.status === 'PENDING' || r.status === 'SNOOZED') && r.scheduledDate.split('T')[0] < tStr),
      upcoming: revisions.filter((r: any) => r.status === 'PENDING' && r.scheduledDate.split('T')[0] > tStr),
      completed: revisions.filter((r: any) => r.status === 'DONE'),
    };
  }, [revisions, tStr]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  const handleAction = (id: string, status: 'DONE' | 'SNOOZED' | 'SKIPPED') => {
    updateStatus.mutate({ id, status });
  };

  const RevisionCard = ({ rev, showActions = false }: { rev: any; showActions?: boolean }) => (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between bg-card/50 backdrop-blur-sm border border-primary/5 rounded-3xl px-6 py-5 hover:border-primary/20 hover:bg-card transition-all duration-300 gap-4">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-secondary/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
          {rev.topic?.subject?.icon}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-bold tracking-widest uppercase bg-accent/10 text-accent px-2 py-0.5 rounded-md">R{rev.revisionNumber}</span>
             <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{rev.topic?.subject?.name}</span>
          </div>
          <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{rev.topic?.name}</p>
          <p className="text-[10px] font-medium text-muted-foreground opacity-60 mt-0.5 italic">{rev.topic?.chapter?.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showActions ? (
          <>
            <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-warning hover:bg-warning/10" onClick={() => handleAction(rev.id, 'SNOOZED')} disabled={updateStatus.isPending}>
              <AlarmClock className="h-3.5 w-3.5 mr-1.5" /> Snooze
            </Button>
            <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleAction(rev.id, 'SKIPPED')} disabled={updateStatus.isPending}>
              <SkipForward className="h-3.5 w-3.5 mr-1.5" /> Skip
            </Button>
            <Button size="sm" className="h-9 px-5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => handleAction(rev.id, 'DONE')} disabled={updateStatus.isPending}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Complete
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black font-mono text-muted-foreground opacity-50 uppercase tracking-widest">{rev.status === 'DONE' ? 'Completed' : 'Scheduled'}</span>
            <span className="text-[10px] font-bold text-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-md">
                {new Date(rev.scheduledDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Revision Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Spaced repetition optimization system</p>
        </div>
        <div className="hidden sm:flex items-center gap-6 bg-card/40 border border-primary/5 px-6 py-3 rounded-2xl">
           <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Pending</p>
              <p className="font-mono text-xl font-bold text-foreground">{(categories.dueToday.length + categories.overdue.length) || 0}</p>
           </div>
           <div className="w-px h-8 bg-primary/10" />
           <div className="text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">Completed</p>
              <p className="font-mono text-xl font-bold text-success">{categories.completed.length || 0}</p>
           </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Overdue */}
        {categories.overdue.length > 0 && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <h2 className="font-heading text-sm font-black mb-5 flex items-center gap-3 text-destructive uppercase tracking-[0.2em]">
               <div className="p-1.5 rounded-lg bg-destructive/10">
                 <Clock className="h-4 w-4" />
               </div>
               Overdue Revisions ({categories.overdue.length})
            </h2>
            <div className="space-y-3">
              {categories.overdue.map((r: any) => <RevisionCard key={r.id} rev={r} showActions />)}
            </div>
          </div>
        )}

        {/* Due today */}
        <div className="animate-in slide-in-from-top-6 duration-700">
          <h2 className="font-heading text-sm font-black mb-5 flex items-center gap-3 text-primary uppercase tracking-[0.2em]">
             <div className="p-1.5 rounded-lg bg-primary/10">
               <RefreshCw className="h-4 w-4" />
             </div>
             Due Today ({categories.dueToday.length})
          </h2>
          {categories.dueToday.length === 0 && categories.overdue.length === 0 ? (
            <div className="bg-card/30 rounded-[2.5rem] border border-dashed border-primary/10 p-16 text-center space-y-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-4xl">🧘</div>
              <div>
                <h3 className="text-xl font-bold">You're All Caught Up</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">No revisions due today. Use this time to learn new topics or refresh old notes.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.dueToday.map((r: any) => <RevisionCard key={r.id} rev={r} showActions />)}
            </div>
          )}
        </div>

        {/* Upcoming */}
        {categories.upcoming.length > 0 && (
          <div className="opacity-80 hover:opacity-100 transition-opacity">
            <h2 className="font-heading text-sm font-black mb-5 flex items-center gap-3 text-muted-foreground uppercase tracking-[0.2em]">
               <div className="p-1.5 rounded-lg bg-secondary">
                 <Clock className="h-4 w-4" />
               </div>
               Upcoming Schedule
            </h2>
            <div className="space-y-3">
              {categories.upcoming.sort((a: any, b: any) => a.scheduledDate.localeCompare(b.scheduledDate)).slice(0, 10).map((r: any) => (
                <RevisionCard key={r.id} rev={r} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {categories.completed.length > 0 && (
          <div className="opacity-60 hover:opacity-100 transition-opacity">
            <h2 className="font-heading text-sm font-black mb-5 flex items-center gap-3 text-success uppercase tracking-[0.2em]">
               <div className="p-1.5 rounded-lg bg-success/10">
                 <CheckCircle2 className="h-4 w-4" />
               </div>
               Successfully Mastered
            </h2>
            <div className="space-y-3">
              {categories.completed.slice(0, 10).map((r: any) => <RevisionCard key={r.id} rev={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
