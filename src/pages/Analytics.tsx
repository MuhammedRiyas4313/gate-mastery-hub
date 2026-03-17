import { useStore } from "@/store/useStore";
import { useMemo } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Analytics() {
  const { subjects, modules, tasks } = useStore();

  const subjectProgress = useMemo(() =>
    subjects.filter((s) => s.isActive).map((sub) => {
      const subModules = modules.filter((m) => m.subjectId === sub.id);
      const subTasks = tasks.filter((t) => subModules.some((m) => m.id === t.moduleId));
      const done = subTasks.filter((t) => t.status === 'done').length;
      const total = subTasks.length;
      return { name: sub.name, icon: sub.icon, color: sub.color, percent: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
    }),
    [subjects, modules, tasks]
  );

  const taskTypeData = useMemo(() => {
    const types = ['lecture', 'dpp', 'revision', 'pyq', 'quiz'];
    return types.map((type) => {
      const typeTasks = tasks.filter((t) => t.type === type);
      const done = typeTasks.filter((t) => t.status === 'done').length;
      return { type: type.toUpperCase(), done, total: typeTasks.length, pending: typeTasks.length - done };
    });
  }, [tasks]);

  const totalTasks = tasks.length;
  const totalDone = tasks.filter((t) => t.status === 'done').length;
  const overallPercent = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Progress & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Visual overview of your GATE preparation</p>
      </div>

      {/* Overall readiness */}
      <div className="bg-card rounded-xl p-6 flex items-center gap-8">
        <ProgressRing percent={overallPercent} size={100} strokeWidth={8} color="hsl(36, 90%, 55%)" />
        <div>
          <h2 className="font-heading text-xl font-bold">GATE Readiness</h2>
          <p className="text-sm text-muted-foreground mt-1">{totalDone} of {totalTasks} tasks completed</p>
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

      {/* Task type chart */}
      <div className="bg-card rounded-xl p-6">
        <h3 className="font-heading text-base font-semibold mb-4">Completion by Task Type</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={taskTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 22%)" />
            <XAxis dataKey="type" tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: 'hsl(228, 20%, 14%)', border: '1px solid hsl(228, 15%, 22%)', borderRadius: '8px', color: 'hsl(225, 30%, 93%)' }} />
            <Bar dataKey="done" fill="hsl(152, 42%, 49%)" radius={[4, 4, 0, 0]} name="Done" />
            <Bar dataKey="pending" fill="hsl(228, 15%, 28%)" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
