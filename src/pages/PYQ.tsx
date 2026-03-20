import { usePYQs } from "@/hooks/usePYQs";
import { useSubjects } from "@/hooks/useSubjects";
import { useState, useMemo } from "react";
import { Plus, Filter, Loader2, Trash2, Award, Target, BookOpen, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PYQ() {
  const { data: pyqs, isLoading, addPYQ, updatePYQ, deletePYQ } = usePYQs();
  const { data: subjects } = useSubjects();

  const [open, setOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const [form, setForm] = useState({
    title: '', year: '', source: '', difficulty: 'MEDIUM',
    status: 'NOT_STARTED', subjectId: '', chapterId: '', topicId: '', notes: '',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addPYQ.mutate({
      ...form,
      subjectId: form.subjectId || undefined,
      chapterId: form.chapterId || undefined,
      topicId: form.topicId || undefined,
    });
    setForm({ title: '', year: '', source: '', difficulty: 'MEDIUM', status: 'NOT_STARTED', subjectId: '', chapterId: '', topicId: '', notes: '' });
    setOpen(false);
  };

  const filtered = useMemo(() => {
    if (!pyqs) return [];
    let list = [...pyqs];
    if (filterSubject !== 'all') list = list.filter((p) => p.subjectId === filterSubject);
    if (filterStatus !== 'all') list = list.filter((p) => p.status === filterStatus);
    if (filterDifficulty !== 'all') list = list.filter((p) => p.difficulty === filterDifficulty);
    return list;
  }, [pyqs, filterSubject, filterStatus, filterDifficulty]);

  const stats = useMemo(() => {
    if (!pyqs) return { total: 0, done: 0, easy: 0, medium: 0, hard: 0 };
    return {
      total: pyqs.length,
      done: pyqs.filter((p: any) => p.status === 'DONE').length,
      easy: pyqs.filter((p: any) => p.difficulty === 'EASY').length,
      medium: pyqs.filter((p: any) => p.difficulty === 'MEDIUM').length,
      hard: pyqs.filter((p: any) => p.difficulty === 'HARD').length,
    };
  }, [pyqs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tight">Question Bank</h1>
          <p className="text-sm text-muted-foreground mt-1">Independent tracking for Previous Year Questions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 h-12 px-8 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> Add New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-8 border-primary/10 shadow-2xl">
            <DialogHeader><DialogTitle className="font-heading text-2xl font-black">Archive PYQ</DialogTitle></DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Identifying Title *</Label>
                <Input className="h-12 rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. GATE 2024 - Discrete Maths Q31" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Year</Label>
                  <Input className="h-12 rounded-xl" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Source</Label>
                  <Input className="h-12 rounded-xl" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="IIT Roorkee" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Difficulty Rating</Label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full bg-secondary/50 border-primary/5 rounded-xl h-11 px-4 text-sm font-bold appearance-none">
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Current Progress</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-secondary/50 border-primary/5 rounded-xl h-11 px-4 text-sm font-bold appearance-none">
                    <option value="NOT_STARTED">UNATTEMPTED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="DONE">COMPLETED</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Linked Subject</Label>
                <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full bg-secondary/50 border-primary/5 rounded-xl h-11 px-4 text-sm font-bold appearance-none">
                  <option value="">No specific subject</option>
                  {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Crucial Observations</Label>
                <Textarea value={form.notes} className="rounded-2xl min-h-[100px] border-primary/5" onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Write about key concepts, traps, or alternative solutions..." />
              </div>
              <Button onClick={handleAdd} className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20" disabled={addPYQ.isPending}>
                {addPYQ.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Archive Question
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Base', value: stats.total, color: 'text-foreground', icon: <BookOpen className="h-4 w-4" /> },
          { label: 'Conquered', value: stats.done, color: 'text-success', icon: <Target className="h-4 w-4" /> },
          { label: 'Level: Easy', value: stats.easy, color: 'text-success', icon: <Award className="h-4 w-4" /> },
          { label: 'Level: Mid', value: stats.medium, color: 'text-warning', icon: <Award className="h-4 w-4" /> },
          { label: 'Level: Hard', value: stats.hard, color: 'text-destructive', icon: <Award className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2rem] px-6 py-6 text-center space-y-1 group hover:border-primary/20 transition-all">
            <div className="flex justify-center opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 transform mb-1">{s.icon}</div>
            <p className={`font-mono text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-card/30 p-4 rounded-3xl border border-primary/5">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-primary" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-background/80 text-xs font-bold border border-primary/5 rounded-xl px-4 h-10 focus:outline-none focus:ring-1 focus:ring-primary appearance-none min-w-[150px]"
          >
            <option value="all">ALL DOMAINS</option>
            {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background/80 text-xs font-bold border border-primary/5 rounded-xl px-4 h-10 focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="all">ALL COGNITION</option>
            <option value="NOT_STARTED">UNATTEMPTED</option>
            <option value="IN_PROGRESS">ACTIVE</option>
            <option value="DONE">MASTERED</option>
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-background/80 text-xs font-bold border border-primary/5 rounded-xl px-4 h-10 focus:outline-none focus:ring-1 focus:ring-primary appearance-none appearance-none"
          >
            <option value="all">ALL INTENSITY</option>
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4">Found {filtered.length} matching entries</p>
      </div>

      {/* Records list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-primary/10">
            <Award className="h-20 w-20 text-muted-foreground/10 mx-auto mb-6" />
            <h3 className="font-heading text-xl font-black">No records found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Expand your search criteria or archive a new question to fill your bank.</p>
          </div>
        ) : (
          filtered.map((pyq: any) => (
            <div key={pyq.id} className="group relative bg-card/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Target className="h-32 w-32" />
              </div>
              <div className="flex flex-col h-full space-y-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1 pr-4">
                    <h4 className="font-heading text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">{pyq.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-muted-foreground/60 tracking-wider">REF: {pyq.year || 'UNKNOWN'}</span>
                      <span className="w-1 h-1 rounded-full bg-secondary" />
                      <span className="text-[10px] font-bold text-primary italic">{pyq.source || 'Standard Repository'}</span>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => deletePYQ.mutate(pyq.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${pyq.difficulty === 'EASY' ? 'bg-success/10 text-success' :
                      pyq.difficulty === 'MEDIUM' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                    }`}>
                    {pyq.difficulty}
                  </div>
                  {pyq.subject && (
                    <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/5 flex items-center gap-2">
                      <span>{pyq.subject.icon}</span> {pyq.subject.name}
                    </div>
                  )}
                </div>

                {pyq.notes && (
                  <div className="bg-secondary/30 p-5 rounded-2xl border border-primary/5">
                    <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed italic">
                      "{pyq.notes}"
                    </p>
                  </div>
                )}

                <div className="pt-4 mt-auto">
                  <button
                    onClick={() => {
                      const nextMap: any = { NOT_STARTED: 'IN_PROGRESS', IN_PROGRESS: 'DONE', DONE: 'NOT_STARTED' };
                      updatePYQ.mutate({ id: pyq.id, status: nextMap[pyq.status], completedAt: nextMap[pyq.status] === 'DONE' ? new Date().toISOString() : null });
                    }}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border flex items-center justify-center gap-3 ${pyq.status === 'DONE' ? 'bg-success/10 text-success border-success/20' :
                        pyq.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
                          'bg-background border-primary/10 text-muted-foreground'
                      }`}
                  >
                    {pyq.status === 'DONE' ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {pyq.status.replace('_', ' ')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
