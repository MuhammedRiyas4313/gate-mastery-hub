import { useStore, type QuizStatus } from "@/store/useStore";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Quizzes() {
  const { subjects, chapters, topics, quizzes, addQuiz, updateQuiz } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', weekNumber: '', quizNumber: '', scheduledDate: new Date().toISOString().split('T')[0],
    subjectId: '', chapterId: '', topicId: '', score: '', totalMarks: '', notes: '',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addQuiz({
      title: form.title,
      weekNumber: form.weekNumber ? Number(form.weekNumber) : undefined,
      quizNumber: form.quizNumber ? Number(form.quizNumber) : undefined,
      scheduledDate: form.scheduledDate,
      status: 'pending',
      score: form.score ? Number(form.score) : undefined,
      totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
      subjectId: form.subjectId || undefined,
      chapterId: form.chapterId || undefined,
      topicId: form.topicId || undefined,
      notes: form.notes,
      addedDate: new Date().toISOString().split('T')[0],
    });
    setForm({ title: '', weekNumber: '', quizNumber: '', scheduledDate: new Date().toISOString().split('T')[0], subjectId: '', chapterId: '', topicId: '', score: '', totalMarks: '', notes: '' });
    setOpen(false);
  };

  // Group by week
  const byWeek = useMemo(() => {
    const grouped = new Map<string, typeof quizzes>();
    quizzes.forEach((q) => {
      const key = q.weekNumber ? `Week ${q.weekNumber}` : 'Unassigned';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(q);
    });
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [quizzes]);

  // Score trend data
  const scoreTrend = useMemo(() => {
    return quizzes
      .filter((q) => q.score !== undefined && q.totalMarks)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .map((q) => ({
        name: q.title.slice(0, 15),
        score: q.score!,
        total: q.totalMarks!,
        pct: Math.round((q.score! / q.totalMarks!) * 100),
      }));
  }, [quizzes]);

  const filteredChapters = form.subjectId ? chapters.filter((c) => c.subjectId === form.subjectId) : chapters;
  const filteredTopics = form.chapterId ? topics.filter((t) => t.chapterId === form.chapterId) : form.subjectId ? topics.filter((t) => t.subjectId === form.subjectId) : topics;

  const statusColor = (s: QuizStatus) => s === 'done' ? 'bg-success/20 text-success' : s === 'missed' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Quiz Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Track quizzes and scores independently</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Quiz</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Add Quiz</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Weekly Quiz 3" /></div>
              <div className="flex gap-4">
                <div className="flex-1"><Label>Week #</Label><Input type="number" value={form.weekNumber} onChange={(e) => setForm({ ...form, weekNumber: e.target.value })} /></div>
                <div className="flex-1"><Label>Quiz # in week</Label><Input type="number" value={form.quizNumber} onChange={(e) => setForm({ ...form, quizNumber: e.target.value })} /></div>
                <div className="flex-1"><Label>Date</Label><Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><Label>Score</Label><Input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
                <div className="flex-1"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} /></div>
              </div>
              <div><Label>Tag Subject</Label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value, chapterId: '', topicId: '' })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">None</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div><Label>Tag Chapter</Label>
                <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value, topicId: '' })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">None</option>{filteredChapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label>Tag Topic</Label>
                <select value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">None</option>{filteredTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={handleAdd} className="w-full">Add Quiz</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Score trend */}
      {scoreTrend.length > 0 && (
        <div className="bg-card rounded-xl p-6">
          <h3 className="font-heading text-base font-semibold mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 15%, 22%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(228, 15%, 55%)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(228, 20%, 14%)', border: '1px solid hsl(228, 15%, 22%)', borderRadius: '8px', color: 'hsl(225, 30%, 93%)' }} />
              <Bar dataKey="pct" fill="hsl(36, 90%, 55%)" radius={[4, 4, 0, 0]} name="Score %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quizzes by week */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl">
          <p className="text-4xl mb-4">🧪</p>
          <h3 className="font-heading text-lg font-semibold">No quizzes yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Add your first quiz to start tracking</p>
        </div>
      ) : (
        byWeek.map(([weekLabel, weekQuizzes]) => (
          <div key={weekLabel}>
            <h3 className="font-heading text-sm font-semibold text-muted-foreground mb-2">{weekLabel}</h3>
            <div className="space-y-2">
              {weekQuizzes.map((quiz) => {
                const sub = quiz.subjectId ? subjects.find((s) => s.id === quiz.subjectId) : undefined;
                return (
                  <div key={quiz.id} className="flex items-center justify-between bg-card rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sub?.icon || '🧪'}</span>
                      <div>
                        <p className="text-sm font-medium">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">{quiz.scheduledDate}{sub ? ` · ${sub.name}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {quiz.score !== undefined && quiz.totalMarks && (
                        <span className="font-mono text-sm text-primary">{quiz.score}/{quiz.totalMarks}</span>
                      )}
                      <button
                        onClick={() => {
                          const next: Record<QuizStatus, QuizStatus> = { pending: 'done', done: 'missed', missed: 'pending' };
                          updateQuiz(quiz.id, { status: next[quiz.status] });
                        }}
                        className={`text-xs font-mono px-2 py-1 rounded ${statusColor(quiz.status)}`}
                      >
                        {quiz.status}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
