import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { RefreshCw, Clock, CheckCircle2, AlarmClock, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

const todayStr = () => new Date().toISOString().split('T')[0];
const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function Revision() {
  const { subjects, chapters, topics, revisions, markRevisionDone, snoozeRevision, skipRevision } = useStore();
  const tStr = todayStr();

  const dueToday = useMemo(() =>
    revisions.filter((r) => (r.status === 'pending' || r.status === 'snoozed') && r.scheduledDate === tStr),
    [revisions, tStr]
  );
  const overdue = useMemo(() =>
    revisions.filter((r) => (r.status === 'pending' || r.status === 'snoozed') && r.scheduledDate < tStr),
    [revisions, tStr]
  );
  const upcoming = useMemo(() =>
    revisions.filter((r) => r.status === 'pending' && r.scheduledDate > tStr && r.scheduledDate <= addDays(tStr, 7)),
    [revisions, tStr]
  );
  const completed = useMemo(() => revisions.filter((r) => r.status === 'done'), [revisions]);

  const getTopic = (topicId: string) => topics.find((t) => t.id === topicId);
  const getChapter = (chapterId: string) => chapters.find((c) => c.id === chapterId);
  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  const RevisionCard = ({ rev, showActions = false }: { rev: typeof revisions[0]; showActions?: boolean }) => {
    const topic = getTopic(rev.topicId);
    const chap = topic ? getChapter(topic.chapterId) : undefined;
    const sub = topic ? getSubject(topic.subjectId) : undefined;
    return (
      <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{sub?.icon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">{topic?.name}</p>
            <p className="text-xs text-muted-foreground">{chap?.name} · {sub?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">R{rev.revisionNumber}</span>
          {showActions ? (
            <>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => skipRevision(rev.id)}>
                <SkipForward className="h-3 w-3 mr-1" /> Skip
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => snoozeRevision(rev.id)}>
                <AlarmClock className="h-3 w-3 mr-1" /> Snooze
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => markRevisionDone(rev.id)}>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Done
              </Button>
            </>
          ) : (
            <span className="text-xs font-mono text-muted-foreground">{rev.scheduledDate}</span>
          )}
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

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <h2 className="font-heading text-base font-semibold mb-3 flex items-center gap-2 text-destructive">
            <Clock className="h-4 w-4" /> Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((r) => <RevisionCard key={r.id} rev={r} showActions />)}
          </div>
        </div>
      )}

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
            {dueToday.map((r) => <RevisionCard key={r.id} rev={r} showActions />)}
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
            {upcoming.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map((r) => <RevisionCard key={r.id} rev={r} />)}
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
            {completed.slice(0, 10).map((r) => <RevisionCard key={r.id} rev={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
