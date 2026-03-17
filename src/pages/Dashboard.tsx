import { useStore } from "@/store/useStore";
import { useMemo, useEffect } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { CheckCircle2, Circle, Clock, Flame, BookOpen, RefreshCw } from "lucide-react";

const today = () => new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const { subjects, modules, tasks, streak, updateStreak, gateExamDate, toggleTaskStatus } = useStore();

  useEffect(() => { updateStreak(); }, [updateStreak]);

  const daysToGate = useMemo(() => {
    const now = new Date();
    const exam = new Date(gateExamDate);
    return Math.max(0, Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, [gateExamDate]);

  const todayStr = today();
  const todayTasks = useMemo(() =>
    tasks.filter((t) => t.dueDate === todayStr),
    [tasks, todayStr]
  );

  const revisionsDueToday = useMemo(() =>
    tasks.filter((t) => t.type === 'revision' && t.status === 'pending' && (t.nextRevisionDate === todayStr || t.dueDate === todayStr)),
    [tasks, todayStr]
  );

  const overdueTasks = useMemo(() =>
    tasks.filter((t) => t.status === 'pending' && t.dueDate < todayStr),
    [tasks, todayStr]
  );

  const subjectProgress = useMemo(() =>
    subjects.filter((s) => s.isActive).map((sub) => {
      const subModules = modules.filter((m) => m.subjectId === sub.id);
      const subTasks = tasks.filter((t) => subModules.some((m) => m.id === t.moduleId));
      const done = subTasks.filter((t) => t.status === 'done').length;
      const total = subTasks.length;
      return { ...sub, percent: total > 0 ? (done / total) * 100 : 0, done, total };
    }),
    [subjects, modules, tasks]
  );

  const getModule = (moduleId: string) => modules.find((m) => m.id === moduleId);
  const getSubject = (moduleId: string) => {
    const mod = getModule(moduleId);
    return mod ? subjects.find((s) => s.id === mod.subjectId) : undefined;
  };

  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
        isToday: d.toISOString().split('T')[0] === todayStr,
      });
    }
    return days;
  }, [todayStr]);

  const taskTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture': return <BookOpen className="h-3.5 w-3.5" />;
      case 'revision': return <RefreshCw className="h-3.5 w-3.5" />;
      default: return <Circle className="h-3.5 w-3.5" />;
    }
  };

  const taskTypeLabel: Record<string, string> = {
    lecture: 'L', dpp: 'DPP', quiz: 'Q', revision: 'R', pyq: 'PYQ', notes: 'N',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Today's Focus</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay on track. One module at a time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl">
            <Flame className="h-5 w-5 text-primary" />
            <div>
              <span className="font-mono font-bold text-lg text-foreground">{streak}</span>
              <span className="text-xs text-muted-foreground ml-1">day streak</span>
            </div>
          </div>
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
            <span className={`font-mono text-lg font-bold mt-0.5 ${d.isToday ? 'text-primary' : 'text-foreground'}`}>
              {d.num}
            </span>
            <div className="flex gap-0.5 mt-1">
              {tasks.filter((t) => t.dueDate === d.date && t.status === 'done').length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
              )}
              {tasks.filter((t) => t.dueDate === d.date && t.status === 'pending').length > 0 && (
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <h3 className="font-heading text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" /> {overdueTasks.length} Overdue Tasks
              </h3>
              <div className="space-y-2">
                {overdueTasks.slice(0, 5).map((task) => {
                  const sub = getSubject(task.moduleId);
                  const mod = getModule(task.moduleId);
                  return (
                    <div key={task.id} className="flex items-center gap-3 text-sm">
                      <button onClick={() => toggleTaskStatus(task.id)} className="shrink-0">
                        <Circle className="h-4 w-4 text-destructive" />
                      </button>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: sub?.color + '20', color: sub?.color }}>
                        {taskTypeLabel[task.type]}
                      </span>
                      <span className="text-foreground">{mod?.name}</span>
                      <span className="text-muted-foreground">· {task.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Today's checklist */}
          <div className="bg-card rounded-xl p-5">
            <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Today's Checklist
              <span className="ml-auto text-xs font-mono text-muted-foreground">
                {todayTasks.filter((t) => t.status === 'done').length}/{todayTasks.length}
              </span>
            </h3>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No tasks scheduled for today ✨</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const sub = getSubject(task.moduleId);
                  const mod = getModule(task.moduleId);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer hover:bg-secondary/50 ${
                        task.status === 'done' ? 'opacity-60' : ''
                      }`}
                      onClick={() => toggleTaskStatus(task.id)}
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: sub?.color + '20', color: sub?.color }}>
                        {taskTypeLabel[task.type]}
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        {taskTypeIcon(task.type)}
                        <span className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {mod?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">· {task.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Revisions due */}
          {revisionsDueToday.length > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
              <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2 text-accent">
                <RefreshCw className="h-4 w-4" /> Revisions Due Today
              </h3>
              <div className="space-y-2">
                {revisionsDueToday.map((task) => {
                  const sub = getSubject(task.moduleId);
                  const mod = getModule(task.moduleId);
                  return (
                    <div key={task.id} className="flex items-center justify-between bg-card rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{sub?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{mod?.name}</p>
                          <p className="text-xs text-muted-foreground">{sub?.name} · {task.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                          R{task.revisionCount + 1}
                        </span>
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
          {/* GATE Countdown */}
          <div className="bg-card rounded-xl p-5 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">GATE Exam In</p>
            <p className="font-mono text-4xl font-bold text-primary mt-2">{daysToGate}</p>
            <p className="text-xs text-muted-foreground mt-1">days remaining</p>
          </div>

          {/* Subject progress */}
          <div className="bg-card rounded-xl p-5">
            <h3 className="font-heading text-sm font-semibold mb-4">Subject Progress</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {subjectProgress.map((sub) => (
                <ProgressRing
                  key={sub.id}
                  percent={sub.percent}
                  color={sub.color}
                  label={sub.name}
                  size={72}
                  strokeWidth={5}
                />
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-card rounded-xl p-5 space-y-3">
            <h3 className="font-heading text-sm font-semibold">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Tasks', value: tasks.length, color: 'text-foreground' },
                { label: 'Completed', value: tasks.filter((t) => t.status === 'done').length, color: 'text-success' },
                { label: 'Pending', value: tasks.filter((t) => t.status === 'pending').length, color: 'text-warning' },
                { label: 'Overdue', value: overdueTasks.length, color: 'text-destructive' },
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
