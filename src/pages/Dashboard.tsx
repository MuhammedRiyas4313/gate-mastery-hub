import { useStore } from "@/store/useStore";
import { useMemo, useEffect } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { CheckCircle2, Circle, Clock, Flame, BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const todayStr = () => new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const { subjects, chapters, topics, revisions, dpps, streak, updateStreak, gateExamDate, toggleLecture, markRevisionDone, snoozeRevision, toggleDPPStatus } = useStore();

  useEffect(() => { updateStreak(); }, [updateStreak]);

  const tStr = todayStr();

  const daysToGate = useMemo(() => {
    const now = new Date();
    const exam = new Date(gateExamDate);
    return Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, [gateExamDate]);

  // Today's topics (taught today)
  const todayTopics = useMemo(() => topics.filter((t) => t.dateTaught === tStr), [topics, tStr]);

  // Today's DPP
  const todayDPP = useMemo(() => dpps.find((d) => d.date === tStr), [dpps, tStr]);

  // Revisions due today
  const revisionsDueToday = useMemo(() =>
    revisions.filter((r) => (r.status === 'pending' || r.status === 'snoozed') && r.scheduledDate === tStr),
    [revisions, tStr]
  );

  // Overdue revisions
  const overdueRevisions = useMemo(() =>
    revisions.filter((r) => (r.status === 'pending' || r.status === 'snoozed') && r.scheduledDate < tStr),
    [revisions, tStr]
  );

  // Subject progress
  const subjectProgress = useMemo(() =>
    subjects.filter((s) => s.isActive).map((sub) => {
      const subTopics = topics.filter((t) => t.subjectId === sub.id);
      const done = subTopics.filter((t) => t.lectureStatus === 'done').length;
      const total = subTopics.length;
      return { ...sub, percent: total > 0 ? (done / total) * 100 : 0, done, total };
    }),
    [subjects, topics]
  );

  const getTopic = (topicId: string) => topics.find((t) => t.id === topicId);
  const getChapter = (chapterId: string) => chapters.find((c) => c.id === chapterId);
  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  // Week strip
  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevs = revisions.filter((r) => r.scheduledDate === dateStr && r.status === 'done').length;
      const dayPending = revisions.filter((r) => r.scheduledDate === dateStr && r.status === 'pending').length;
      days.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
        isToday: dateStr === tStr,
        hasDone: dayRevs > 0,
        hasPending: dayPending > 0,
      });
    }
    return days;
  }, [tStr, revisions]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Today's Focus</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay on track. One topic at a time.</p>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-mono font-bold text-lg text-foreground">{streak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
      </div>

      {/* Week strip */}
      <div className="flex gap-2">
        {weekDays.map((d) => (
          <div
            key={d.date}
            className={`flex-1 flex flex-col items-center py-2.5 rounded-xl text-xs transition-colors ${
              d.isToday ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-card text-muted-foreground'
            }`}
          >
            <span className="font-medium">{d.day}</span>
            <span className={`font-mono text-lg font-bold mt-0.5 ${d.isToday ? 'text-primary' : 'text-foreground'}`}>{d.num}</span>
            <div className="flex gap-0.5 mt-1">
              {d.hasDone && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
              {d.hasPending && <div className="w-1.5 h-1.5 rounded-full bg-warning" />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Overdue */}
          {overdueRevisions.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <h3 className="font-heading text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" /> {overdueRevisions.length} Overdue Revisions
              </h3>
              <div className="space-y-2">
                {overdueRevisions.slice(0, 5).map((rev) => {
                  const topic = getTopic(rev.topicId);
                  const sub = topic ? getSubject(topic.subjectId) : undefined;
                  return (
                    <div key={rev.id} className="flex items-center gap-3 text-sm">
                      <span className="text-xs font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded">R{rev.revisionNumber}</span>
                      <span className="text-foreground">{topic?.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{sub?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's Topics */}
          <div className="bg-card rounded-xl p-5">
            <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Today's Topics
              <span className="ml-auto text-xs font-mono text-muted-foreground">
                {todayTopics.filter((t) => t.lectureStatus === 'done').length}/{todayTopics.length}
              </span>
            </h3>
            {todayTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No topics taught today ✨</p>
            ) : (
              <div className="space-y-2">
                {todayTopics.map((topic) => {
                  const sub = getSubject(topic.subjectId);
                  const chap = getChapter(topic.chapterId);
                  return (
                    <div
                      key={topic.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors ${topic.lectureStatus === 'done' ? 'opacity-60' : ''}`}
                      onClick={() => toggleLecture(topic.id)}
                    >
                      {topic.lectureStatus === 'done' ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: sub?.color + '20', color: sub?.color }}>L</span>
                      <span className={`text-sm ${topic.lectureStatus === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{topic.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{chap?.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's DPP */}
          {todayDPP && (
            <div className="bg-card rounded-xl p-5">
              <h3 className="font-heading text-base font-semibold mb-3 flex items-center gap-2">
                📋 Today's DPP
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {todayDPP.subjectTags.map((sid) => {
                    const s = getSubject(sid);
                    return s ? <span key={sid} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: s.color + '20', color: s.color }}>{s.icon} {s.name}</span> : null;
                  })}
                </div>
                <Button
                  size="sm"
                  variant={todayDPP.status === 'done' ? 'secondary' : 'default'}
                  className="h-7 text-xs"
                  onClick={() => toggleDPPStatus(todayDPP.id)}
                >
                  {todayDPP.status === 'done' ? '✓ Done' : 'Mark Done'}
                </Button>
              </div>
            </div>
          )}

          {/* Revisions due today */}
          {revisionsDueToday.length > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
              <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2 text-accent">
                <RefreshCw className="h-4 w-4" /> Revisions Due Today ({revisionsDueToday.length})
              </h3>
              <div className="space-y-2">
                {revisionsDueToday.map((rev) => {
                  const topic = getTopic(rev.topicId);
                  const sub = topic ? getSubject(topic.subjectId) : undefined;
                  const chap = topic ? getChapter(topic.chapterId) : undefined;
                  return (
                    <div key={rev.id} className="flex items-center justify-between bg-card rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{sub?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{topic?.name}</p>
                          <p className="text-xs text-muted-foreground">{chap?.name} · {sub?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">R{rev.revisionNumber}</span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => snoozeRevision(rev.id)}>Snooze</Button>
                        <Button size="sm" className="h-7 text-xs" onClick={() => markRevisionDone(rev.id)}>Done</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-5 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">GATE Exam In</p>
            <p className="font-mono text-4xl font-bold text-primary mt-2">{daysToGate}</p>
            <p className="text-xs text-muted-foreground mt-1">days remaining</p>
          </div>

          <div className="bg-card rounded-xl p-5">
            <h3 className="font-heading text-sm font-semibold mb-4">Subject Progress</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {subjectProgress.map((sub) => (
                <ProgressRing key={sub.id} percent={sub.percent} color={sub.color} label={sub.name} size={72} strokeWidth={5} />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Topics', value: topics.length, color: 'text-foreground' },
                { label: 'Lectures Done', value: topics.filter((t) => t.lectureStatus === 'done').length, color: 'text-success' },
                { label: 'Revisions Done', value: revisions.filter((r) => r.status === 'done').length, color: 'text-accent' },
                { label: 'Overdue', value: overdueRevisions.length, color: 'text-destructive' },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <p className={`font-mono text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
