import { useStore, type Subject, type Module } from "@/store/useStore";
import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TASK_LABELS: Record<string, string> = { lecture: 'L', dpp: 'DPP', quiz: 'Q', revision: 'R', pyq: 'PYQ', notes: 'N' };

export default function Subjects() {
  const { subjects, modules, tasks, addSubject, addModuleWithTasks, deleteSubject, deleteModule, toggleTaskStatus } = useStore();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [newModOpen, setNewModOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📘', color: '#4f8ef7' });
  const [modForm, setModForm] = useState({ name: '', dateTaught: new Date().toISOString().split('T')[0] });

  const toggle = (id: string) => setExpanded((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);

  const handleAddSubject = () => {
    if (!form.name.trim()) return;
    addSubject({ name: form.name, icon: form.icon, color: form.color, startDate: new Date().toISOString().split('T')[0], isActive: true });
    setForm({ name: '', icon: '📘', color: '#4f8ef7' });
    setNewSubOpen(false);
  };

  const handleAddModule = (subjectId: string) => {
    if (!modForm.name.trim()) return;
    const subModules = modules.filter((m) => m.subjectId === subjectId);
    addModuleWithTasks(subjectId, modForm.name, modForm.dateTaught, subModules.length);
    setModForm({ name: '', dateTaught: new Date().toISOString().split('T')[0] });
    setNewModOpen(null);
  };

  const getModuleTasks = (moduleId: string) => tasks.filter((t) => t.moduleId === moduleId);
  const getModuleTaskTypes = (moduleId: string) => {
    const modTasks = getModuleTasks(moduleId);
    const types = ['lecture', 'dpp', 'revision', 'pyq'];
    return types.map((type) => {
      const matching = modTasks.filter((t) => t.type === type);
      const allDone = matching.length > 0 && matching.every((t) => t.status === 'done');
      return { type, done: allDone, count: matching.length };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subjects & Modules</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your study syllabus</p>
        </div>
        <Dialog open={newSubOpen} onOpenChange={setNewSubOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">New Subject</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Linear Algebra" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Icon (emoji)</Label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                </div>
                <div className="flex-1">
                  <Label>Color</Label>
                  <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10" />
                </div>
              </div>
              <Button onClick={handleAddSubject} className="w-full">Create Subject</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {subjects.filter((s) => s.isActive).map((sub) => {
          const subModules = modules.filter((m) => m.subjectId === sub.id).sort((a, b) => a.orderIndex - b.orderIndex);
          const isOpen = expanded.includes(sub.id);
          const totalTasks = tasks.filter((t) => subModules.some((m) => m.id === t.moduleId));
          const doneTasks = totalTasks.filter((t) => t.status === 'done');

          return (
            <div key={sub.id} className="bg-card rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => toggle(sub.id)}
              >
                <span className="text-xl">{sub.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground">{sub.name}</h3>
                  <p className="text-xs text-muted-foreground">{subModules.length} modules · {doneTasks.length}/{totalTasks.length} tasks done</p>
                </div>
                <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalTasks.length > 0 ? (doneTasks.length / totalTasks.length) * 100 : 0}%`, background: sub.color }}
                  />
                </div>
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>

              {isOpen && (
                <div className="border-t border-border">
                  {subModules.map((mod, idx) => {
                    const typeStatus = getModuleTaskTypes(mod.id);
                    return (
                      <div key={mod.id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors border-b border-border/50 last:border-0">
                        <span className="text-xs font-mono text-muted-foreground w-5">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{mod.name}</p>
                          {mod.dateTaught && <p className="text-[10px] text-muted-foreground">Taught: {mod.dateTaught}</p>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {typeStatus.map((ts) => (
                            <span
                              key={ts.type}
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                ts.done ? 'bg-success/20 text-success' : ts.count > 0 ? 'bg-secondary text-muted-foreground' : 'bg-secondary/50 text-muted-foreground/50'
                              }`}
                            >
                              {TASK_LABELS[ts.type]}
                            </span>
                          ))}
                        </div>
                        <button onClick={() => deleteModule(mod.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add module */}
                  {newModOpen === sub.id ? (
                    <div className="px-5 py-3 flex items-end gap-3 bg-secondary/20">
                      <div className="flex-1">
                        <Label className="text-xs">Module Name</Label>
                        <Input size={1} value={modForm.name} onChange={(e) => setModForm({ ...modForm, name: e.target.value })} placeholder="e.g. Determinants" className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs">Date Taught</Label>
                        <Input type="date" value={modForm.dateTaught} onChange={(e) => setModForm({ ...modForm, dateTaught: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <Button size="sm" className="h-8" onClick={() => handleAddModule(sub.id)}>Add</Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setNewModOpen(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewModOpen(sub.id)}
                      className="w-full px-5 py-2.5 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/20 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" /> Add module
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {subjects.filter((s) => s.isActive).length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📚</p>
            <h3 className="font-heading text-lg font-semibold">No subjects yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first subject to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
