import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { RefreshCw, Clock, CheckCircle2, AlarmClock } from "lucide-react";
import { Button } from "@/components/ui/button";

const today = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function Revision() {
  const { subjects, modules, tasks, markRevisionDone, snoozeRevision } = useStore();
  const todayStr = today();

  const revisionTasks = useMemo(() => tasks.filter((t) => t.type === 'revision'), [tasks]);

  const dueToday = revisionTasks.filter((t) => t.status === 'pending' && (t.dueDate === todayStr || (t.nextRevisionDate && t.nextRevisionDate === todayStr)));
  const upcoming = revisionTasks.filter((t) => t.status === 'pending' && t.dueDate > todayStr && t.dueDate <= addDays(todayStr, 7));
  const completed = revisionTasks.filter((t) => t.status === 'done');

  const getModule = (id: string) => modules.find((m) => m.id === id);
  const getSubject = (moduleId: string) => {
    const mod = getModule(moduleId);
    return mod ? subjects.find((s) => s.id === mod.subjectId) : undefined;
  };

  const RevisionCard = ({ task, showActions = false }: { task: typeof tasks[0]; showActions?: boolean }) => {
    const sub = getSubject(task.moduleId);
    const mod = getModule(task.moduleId);
    return (
      <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{sub?.icon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">{mod?.name}</p>
            <p className="text-xs text-muted-foreground">{sub?.name} · {task.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">R{task.revisionCount + 1}</span>
          {showActions && (
            <>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => snoozeRevision(task.id)}>
                <AlarmClock className="h-3 w-3 mr-1" /> Snooze
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => markRevisionDone(task.id)}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Done
              </Button>
            </>
          )}
          {!showActions && <span className="text-xs font-mono text-muted-foreground">{task.dueDate}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Revision Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Spaced repetition: Day 1 → 3 → 7 → 14 → 30</p>
      </div>

      {/* Due today */}
      <div>
        <h2 className="font-heading text-base font-semibold mb-3 flex items-center gap-2 text-primary">
          <RefreshCw className="h-4 w-4" /> Due Today ({dueToday.length})
        </h2>
        {dueToday.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No revisions due today 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dueToday.map((t) => <RevisionCard key={t.id} task={t} showActions />)}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="font-heading text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" /> Upcoming (next 7 days)
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nothing upcoming</p>
        ) : (
          <div className="space-y-2">
            {upcoming.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((t) => <RevisionCard key={t.id} task={t} />)}
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <h2 className="font-heading text-base font-semibold mb-3 flex items-center gap-2 text-success">
          <CheckCircle2 className="h-4 w-4" /> Completed ({completed.length})
        </h2>
        {completed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No completed revisions yet</p>
        ) : (
          <div className="space-y-2">
            {completed.slice(0, 10).map((t) => <RevisionCard key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
