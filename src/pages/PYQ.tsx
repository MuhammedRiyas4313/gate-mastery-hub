import { useStore, type PYQDifficulty, type PYQStatus } from "@/store/useStore";
import { useState, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PYQ() {
  const { subjects, chapters, topics, pyqs, addPYQ, updatePYQ, deletePYQ } = useStore();
  const [open, setOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [form, setForm] = useState({
    title: '', year: '', source: '', difficulty: 'medium' as PYQDifficulty,
    status: 'not_started' as PYQStatus, subjectId: '', chapterId: '', topicId: '', notes: '',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addPYQ({
      title: form.title, year: form.year || undefined, source: form.source || undefined,
      difficulty: form.difficulty, status: form.status,
      subjectId: form.subjectId || undefined, chapterId: form.chapterId || undefined, topicId: form.topicId || undefined,
      notes: form.notes, addedDate: new Date().toISOString().split('T')[0],
    });
    setForm({ title: '', year: '', source: '', difficulty: 'medium', status: 'not_started', subjectId: '', chapterId: '', topicId: '', notes: '' });
    setOpen(false);
  };

  const filtered = useMemo(() => {
    let list = [...pyqs];
    if (filterSubject !== 'all') list = list.filter((p) => p.subjectId === filterSubject);
    if (filterStatus !== 'all') list = list.filter((p) => p.status === filterStatus);
    if (filterDifficulty !== 'all') list = list.filter((p) => p.difficulty === filterDifficulty);
    return list;
  }, [pyqs, filterSubject, filterStatus, filterDifficulty]);

  const filteredChapters = form.subjectId ? chapters.filter((c) => c.subjectId === form.subjectId) : chapters;
  const filteredTopics = form.chapterId ? topics.filter((t) => t.chapterId === form.chapterId) : form.subjectId ? topics.filter((t) => t.subjectId === form.subjectId) : topics;

  const stats = useMemo(() => ({
    total: pyqs.length,
    done: pyqs.filter((p) => p.status === 'done').length,
    easy: pyqs.filter((p) => p.difficulty === 'easy').length,
    medium: pyqs.filter((p) => p.difficulty === 'medium').length,
    hard: pyqs.filter((p) => p.difficulty === 'hard').length,
  }), [pyqs]);

  const difficultyColor = (d: PYQDifficulty) => d === 'easy' ? 'bg-success/20 text-success' : d === 'medium' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive';
  const statusColor = (s: PYQStatus) => s === 'done' ? 'bg-success/20 text-success' : s === 'in_progress' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">PYQ Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Track Previous Year Questions independently</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add PYQ</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Add PYQ</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. GATE 2022 - Q14" /></div>
              <div className="flex gap-4">
                <div className="flex-1"><Label>Year</Label><Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2022" /></div>
                <div className="flex-1"><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="GATE 2022" /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Difficulty</Label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as PYQDifficulty })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label>Status</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PYQStatus })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                    <option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div><Label>Tag Subject (optional)</Label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value, chapterId: '', topicId: '' })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">None</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div><Label>Tag Chapter (optional)</Label>
                <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value, topicId: '' })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">None</option>{filteredChapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label>Tag Topic (optional)</Label>
                <select value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">None</option>{filteredTopics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Add notes..." /></div>
              <Button onClick={handleAdd} className="w-full">Add PYQ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {[
          { label: 'Total', value: stats.total, cls: 'text-foreground' },
          { label: 'Done', value: stats.done, cls: 'text-success' },
          { label: 'Easy', value: stats.easy, cls: 'text-success' },
          { label: 'Medium', value: stats.medium, cls: 'text-warning' },
          { label: 'Hard', value: stats.hard, cls: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl px-4 py-3 text-center flex-1">
            <p className={`font-mono text-lg font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5">
          <option value="all">All Subjects</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5">
          <option value="all">All Status</option><option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="done">Done</option>
        </select>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5">
          <option value="all">All Difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
      </div>

      {/* PYQ list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="font-heading text-lg font-semibold">No PYQs yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Add your first PYQ to start tracking</p>
          </div>
        ) : (
          filtered.map((pyq) => {
            const sub = pyq.subjectId ? subjects.find((s) => s.id === pyq.subjectId) : undefined;
            return (
              <div key={pyq.id} className="bg-card rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{pyq.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {pyq.year && <span className="text-[10px] text-muted-foreground">{pyq.year}</span>}
                    {sub && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: sub.color + '20', color: sub.color }}>{sub.icon} {sub.name}</span>}
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-1 rounded ${difficultyColor(pyq.difficulty)}`}>{pyq.difficulty}</span>
                <button
                  onClick={() => {
                    const next: Record<PYQStatus, PYQStatus> = { not_started: 'in_progress', in_progress: 'done', done: 'not_started' };
                    updatePYQ(pyq.id, { status: next[pyq.status], completedAt: next[pyq.status] === 'done' ? new Date().toISOString().split('T')[0] : undefined });
                  }}
                  className={`text-[10px] font-mono px-2 py-1 rounded ${statusColor(pyq.status)}`}
                >
                  {pyq.status.replace('_', ' ')}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
