import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { CheckCircle2, Circle, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const today = () => new Date().toISOString().split('T')[0];
const TASK_LABELS: Record<string, string> = { lecture: 'L', dpp: 'DPP', quiz: 'Q', revision: 'R', pyq: 'PYQ', notes: 'N' };

export default function Tasks() {
  const { subjects, modules, tasks, toggleTaskStatus } = useStore();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const todayStr = today();

  const filtered = useMemo(() => {
    let t = [...tasks];
    if (filterSubject !== 'all') {
      const subModIds = modules.filter((m) => m.subjectId === filterSubject).map((m) => m.id);
      t = t.filter((task) => subModIds.includes(task.moduleId));
    }
    if (filterType !== 'all') t = t.filter((task) => task.type === filterType);
    return t;
  }, [tasks, modules, filterSubject, filterType]);

  const groups = {
    all: filtered,
    pending: filtered.filter((t) => t.status === 'pending'),
    done: filtered.filter((t) => t.status === 'done'),
    overdue: filtered.filter((t) => t.status === 'pending' && t.dueDate < todayStr),
  };

  const getModule = (id: string) => modules.find((m) => m.id === id);
  const getSubject = (moduleId: string) => {
    const mod = getModule(moduleId);
    return mod ? subjects.find((s) => s.id === mod.subjectId) : undefined;
  };

  const urgencyColor = (dueDate: string, status: string) => {
    if (status === 'done') return 'text-success';
    if (dueDate < todayStr) return 'text-destructive';
    if (dueDate === todayStr) return 'text-warning';
    return 'text-muted-foreground';
  };

  const renderTask = (task: typeof tasks[0]) => {
    const sub = getSubject(task.moduleId);
    const mod = getModule(task.moduleId);
    return (
      <div
        key={task.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-card hover:bg-secondary/30 transition-colors cursor-pointer ${
          task.status === 'done' ? 'opacity-50' : ''
        }`}
        onClick={() => toggleTaskStatus(task.id)}
      >
        {task.status === 'done' ? (
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: sub?.color + '20', color: sub?.color }}>
          {TASK_LABELS[task.type]}
        </span>
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{mod?.name}</span>
          <span className="text-xs text-muted-foreground ml-2">· {task.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{sub?.name}</span>
        <span className={`text-xs font-mono ${urgencyColor(task.dueDate, task.status)}`}>{task.dueDate}</span>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Task Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">All your tasks in one place</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5"
        >
          <option value="all">All Types</option>
          {Object.entries(TASK_LABELS).map(([k, v]) => <option key={k} value={k}>{v} - {k}</option>)}
        </select>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-card">
          <TabsTrigger value="all">All ({groups.all.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
          <TabsTrigger value="done">Done ({groups.done.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({groups.overdue.length})</TabsTrigger>
        </TabsList>
        {Object.entries(groups).map(([key, list]) => (
          <TabsContent key={key} value={key} className="space-y-2 mt-4">
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks here ✨</p>
            ) : (
              list.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(renderTask)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
