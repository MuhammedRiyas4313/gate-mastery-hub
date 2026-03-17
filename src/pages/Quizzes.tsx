import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Quizzes() {
  const { quizzes, subjects, modules, addQuiz, updateQuiz } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ moduleId: '', weekNumber: 1, label: 'Quiz 1', score: '', totalMarks: '' });

  const getModule = (id: string) => modules.find((m) => m.id === id);
  const getSubject = (moduleId: string) => {
    const mod = getModule(moduleId);
    return mod ? subjects.find((s) => s.id === mod.subjectId) : undefined;
  };

  const handleAdd = () => {
    if (!form.moduleId) return;
    addQuiz({
      moduleId: form.moduleId,
      weekNumber: form.weekNumber,
      label: form.label,
      status: 'pending',
      score: form.score ? Number(form.score) : undefined,
      totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
    });
    setOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Weekly Quiz Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your weekly quizzes and scores</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Quiz</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Log Quiz</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Module</Label>
                <select value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">Select module</option>
                  {modules.map((m) => {
                    const sub = subjects.find((s) => s.id === m.subjectId);
                    return <option key={m.id} value={m.id}>{sub?.icon} {sub?.name} → {m.name}</option>;
                  })}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Week #</Label>
                  <Input type="number" value={form.weekNumber} onChange={(e) => setForm({ ...form, weekNumber: Number(e.target.value) })} />
                </div>
                <div className="flex-1">
                  <Label>Label</Label>
                  <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Score (optional)</Label>
                  <Input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                </div>
                <div className="flex-1">
                  <Label>Total Marks</Label>
                  <Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Log Quiz</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl">
            <p className="text-4xl mb-4">🧪</p>
            <h3 className="font-heading text-lg font-semibold">No quizzes logged yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first quiz to start tracking</p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const sub = getSubject(quiz.moduleId);
            const mod = getModule(quiz.moduleId);
            return (
              <div key={quiz.id} className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{sub?.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{quiz.label} · {mod?.name}</p>
                    <p className="text-xs text-muted-foreground">Week {quiz.weekNumber} · {sub?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {quiz.score !== undefined && (
                    <span className="font-mono text-sm text-primary">{quiz.score}/{quiz.totalMarks}</span>
                  )}
                  <button
                    onClick={() => updateQuiz(quiz.id, { status: quiz.status === 'done' ? 'pending' : 'done' })}
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      quiz.status === 'done' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {quiz.status}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
