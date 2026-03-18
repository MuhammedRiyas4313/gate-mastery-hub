import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Analytics() {
  const { subjects, topics, revisions, dpps, pyqs, quizzes } = useStore();

  // Per-subject progress (topics taught / total)
  const subjectProgress = useMemo(() =>
    subjects.filter((s) => s.isActive).map((sub) => {
      const subTopics = topics.filter((t) => t.subjectId === sub.id);
      const done = subTopics.filter((t) => t.lectureStatus === 'done').length;
      const total = subTopics.length;
      return { name: sub.name, icon: sub.icon, color: sub.color, percent: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
    }),
    [subjects, topics]
  );

  // Revision completion by slot
  const revisionBySlot = useMemo(() => {
    return [1, 2, 3, 4, 5].map((n) => {
      const slot = revisions.filter((r) => r.revisionNumber === n);
      const done = slot.filter((r) => r.status === 'done').length;
      return { slot: `R${n}`, done, pending: slot.length - done, total: slot.length };
    });
  }, [revisions]);

  // Overall stats
  const lecturesDone = topics.filter((t) => t.lectureStatus === 'done').length;
  const totalTopics = topics.length;
  const revsDone = revisions.filter((r) => r.status === 'done').length;
  const totalRevs = revisions.length;
  const dppsDone = dpps.filter((d) => d.status === 'done').length;
  const pyqsDone = pyqs.filter((p) => p.status === 'done').length;
  const quizzesDone = quizzes.filter((q) => q.status === 'done').length;

  // Weighted readiness
  const readiness = useMemo(() => {
    const lectureRate = totalTopics > 0 ? lecturesDone / totalTopics : 0;
    const revRate = totalRevs > 0 ? revsDone / totalRevs : 0;
    const dppRate = dpps.length > 0 ? dppsDone / dpps.length : 0;
    const pyqRate = pyqs.length > 0 ? pyqsDone / pyqs.length : 0;
    const quizRate = quizzes.length > 0 ? quizzesDone / quizzes.length : 0;
    // Weights: Lecture 25%, Revision 30%, DPP 15%, PYQ 20%, Quiz 10%
    return Math.round((lectureRate * 25 + revRate * 30 + dppRate * 15 + pyqRate * 20 + quizRate * 10));
  }, [lecturesDone, totalTopics, revsDone, totalRevs, dppsDone, dpps.length, pyqsDone, pyqs.length, quizzesDone, quizzes.length]);

  // PYQ by difficulty
  const pyqByDifficulty = useMemo(() => {
    return ['easy', 'medium', 'hard'].map((d) => {
      const items = pyqs.filter((p) => p.difficulty === d);
      return { difficulty: d.charAt(0).toUpperCase() + d.slice(1), done: items.filter((p) => p.status === 'done').length, pending: items.filter((p) => p.status !== 'done').length };
    });
  }, [pyqs]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Progress & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Visual overview of your GATE preparation</p>
      </div>

      {/* Overall readiness */}
      <div className="bg-card rounded-xl p-6 flex items-center gap-8">
        <ProgressRing percent={readiness} size={100} strokeWidth={8} color="hsl(36, 90%, 55%)" />
        <div>
          <h2 className="font-heading text-xl font-bold">GATE Readiness</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Lectures: {lecturesDone}/{totalTopics} · Revisions: {revsDone}/{totalRevs} · DPPs: {dppsDone}/{dpps.length} · PYQs: {pyqsDone}/{pyqs.length} · Quizzes: {quizzesDone}/{quizzes.length}
          </p>
        </div>
      </div>

      {/* Subject progress */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="font-heading text-base font-semibold mb-4">Per Subject Progress</h3>
        <div className="space-y-3">
          {subjectProgress.map((sub) => (
            <div key={sub.name} className="flex items-center gap-3">
              <span className="text-lg w-8">{sub.icon}</span>
              <span className="text-sm w-40 truncate">{sub.name}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sub.percent}%`, background: sub.color }} />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-16 text-right">{sub.done}/{sub.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revision by slot */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="font-heading text-base font-semibold mb-4">Revision Completion by Slot</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revisionBySlot}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 22%)" />
            <XAxis dataKey="slot" tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'hsl(228, 20%, 14%)', border: '1px solid hsl(228, 15%, 22%)', borderRadius: '8px', color: 'hsl(225, 30%, 93%)' }} />
            <Bar dataKey="done" fill="hsl(152, 42%, 49%)" radius={[4, 4, 0, 0]} name="Done" />
            <Bar dataKey="pending" fill="hsl(228, 15%, 28%)" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PYQ by difficulty */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="font-heading text-base font-semibold mb-4">PYQ by Difficulty</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={pyqByDifficulty}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 22%)" />
            <XAxis dataKey="difficulty" tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'hsl(228, 20%, 14%)', border: '1px solid hsl(228, 15%, 22%)', borderRadius: '8px', color: 'hsl(225, 30%, 93%)' }} />
            <Bar dataKey="done" fill="hsl(152, 42%, 49%)" radius={[4, 4, 0, 0]} name="Done" />
            <Bar dataKey="pending" fill="hsl(228, 15%, 28%)" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap />
    </div>
  );
}
