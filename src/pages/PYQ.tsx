import { useStore } from "@/store/useStore";
import { useMemo } from "react";

const STATUSES = ['pending', 'done', 'skipped'] as const;

export default function PYQ() {
  const { subjects, modules, tasks, toggleTaskStatus } = useStore();

  const pyqTasks = useMemo(() => tasks.filter((t) => t.type === 'pyq'), [tasks]);

  const getModule = (id: string) => modules.find((m) => m.id === id);
  const getSubject = (moduleId: string) => {
    const mod = getModule(moduleId);
    return mod ? subjects.find((s) => s.id === mod.subjectId) : undefined;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">PYQ Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">Track Previous Year Question practice</p>
      </div>

      <div className="bg-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Module</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {pyqTasks.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No PYQ tasks yet</td></tr>
            ) : (
              pyqTasks.map((task) => {
                const sub = getSubject(task.moduleId);
                const mod = getModule(task.moduleId);
                return (
                  <tr key={task.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => toggleTaskStatus(task.id)}>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: sub?.color + '20', color: sub?.color }}>
                        {sub?.icon} {sub?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{mod?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        task.status === 'done' ? 'bg-success/20 text-success' : task.status === 'skipped' ? 'bg-muted text-muted-foreground' : 'bg-warning/20 text-warning'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{task.dueDate}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
