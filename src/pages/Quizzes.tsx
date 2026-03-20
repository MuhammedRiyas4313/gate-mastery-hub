import { useQuizzes } from "@/hooks/useQuizzes";
import { useSubjects } from "@/hooks/useSubjects";
import { useState, useMemo } from "react";
import { Plus, Loader2, Award, Target, Zap, Clock, Save, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function Quizzes() {
  const { data: quizzes, isLoading, addQuiz, updateQuiz, deleteQuiz } = useQuizzes();
  const { data: subjects } = useSubjects();
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', weekNumber: '', quizNumber: '', scheduledDate: new Date().toISOString().split('T')[0],
    subjectId: '', chapterId: '', topicId: '', score: '', totalMarks: '', notes: '',
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addQuiz.mutate({
      ...form,
      weekNumber: form.weekNumber ? Number(form.weekNumber) : undefined,
      quizNumber: form.quizNumber ? Number(form.quizNumber) : undefined,
      score: form.score ? Number(form.score) : undefined,
      totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
      subjectId: form.subjectId || undefined,
      chapterId: form.chapterId || undefined,
      topicId: form.topicId || undefined,
      status: 'PENDING'
    });
    setForm({ title: '', weekNumber: '', quizNumber: '', scheduledDate: new Date().toISOString().split('T')[0], subjectId: '', chapterId: '', topicId: '', score: '', totalMarks: '', notes: '' });
    setOpen(false);
  };

  const byWeek = useMemo(() => {
    if (!quizzes) return [];
    const grouped = new Map<string, any[]>();
    quizzes.forEach((q: any) => {
      const key = q.weekNumber ? `Week ${q.weekNumber}` : 'General Assessments';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(q);
    });
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [quizzes]);

  const scoreTrend = useMemo(() => {
     if (!quizzes) return [];
     return [...quizzes]
       .filter((q: any) => q.score !== null && q.totalMarks)
       .sort((a: any, b: any) => a.scheduledDate.localeCompare(b.scheduledDate))
       .map((q: any) => ({
         name: q.title.length > 8 ? q.title.slice(0, 8) + '..' : q.title,
         pct: Math.round((q.score! / q.totalMarks!) * 100),
         fullName: q.title
       }));
  }, [quizzes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tight">Assessment Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Track quizzes, mock tests, and weekly evaluations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 px-8 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20 gap-2">
               <Plus className="h-5 w-5" /> Record Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-8 border-primary/10 shadow-2xl">
             <DialogHeader><DialogTitle className="font-heading text-2xl font-black">Archive Assessment Unit</DialogTitle></DialogHeader>
             <div className="space-y-6 pt-4">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Assessment Title *</Label>
                  <Input className="h-12 rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algorithms Mock Test 1" />
               </div>
               <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Week #</Label>
                    <Input type="number" className="h-12 rounded-xl" value={form.weekNumber} onChange={(e) => setForm({ ...form, weekNumber: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Quiz # in Week</Label>
                    <Input type="number" className="h-12 rounded-xl" value={form.quizNumber} onChange={(e) => setForm({ ...form, quizNumber: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Date</Label>
                    <Input type="date" className="h-12 rounded-xl" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Score Obtained</Label>
                    <Input type="number" className="h-12 rounded-xl" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground">Max Marks</Label>
                    <Input type="number" className="h-12 rounded-xl" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground">Primary Subject Domain</Label>
                 <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="w-full bg-secondary/50 border-primary/5 rounded-xl h-11 px-4 text-sm font-bold appearance-none">
                   <option value="">No specific domain</option>
                   {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">Session Reflections</Label>
                  <Textarea value={form.notes} className="rounded-2xl min-h-[100px] border-primary/5" onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Mistakes identified, topics to revisit..." />
               </div>
               <Button onClick={handleAdd} className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20" disabled={addQuiz.isPending}>
                 {addQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                 Log Assessment
               </Button>
             </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Slide */}
      {scoreTrend.length > 0 && (
        <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-10 shadow-sm space-y-8 group hover:border-primary/20 transition-all duration-500">
           <div className="flex items-center justify-between">
               <h3 className="font-heading text-xl font-bold flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary fill-primary/20" /> Score Velocity Trend
               </h3>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10">Recent Accuracy</span>
               </div>
           </div>
           <div className="h-[240px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={scoreTrend}>
                 <defs>
                   <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                     <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="8 8" stroke="hsl(var(--primary) / 0.05)" vertical={false} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                 <Tooltip cursor={{ fill: 'hsl(var(--primary) / 0.03)', radius: 10 }} contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', fontWeight: 700 }} />
                 <Bar dataKey="pct" radius={[10, 10, 10, 10]} name="Score Efficiency %" barSize={40}>
                   {scoreTrend.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill="url(#scoreGrad)" />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-12">
        {quizzes?.length === 0 ? (
          <div className="text-center py-24 bg-card/20 rounded-[3rem] border border-dashed border-primary/10">
            <Target className="h-20 w-20 text-muted-foreground/10 mx-auto mb-6" />
            <h3 className="font-heading text-xl font-black text-foreground">No Assessments Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto font-medium">Log your first quiz or mock test results to start tracking your performance benchmarks.</p>
          </div>
        ) : (
          byWeek.map(([weekLabel, weekQuizzes]) => (
            <div key={weekLabel} className="space-y-5 animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-4 px-2">
                 <div className="h-px bg-primary/10 flex-1" />
                 <h3 className="font-heading text-xs font-black text-primary uppercase tracking-[0.3em] bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">{weekLabel}</h3>
                 <div className="h-px bg-primary/10 flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weekQuizzes.map((quiz: any) => (
                  <div key={quiz.id} className="group relative bg-card/50 backdrop-blur-md rounded-[2.5rem] p-8 border border-primary/5 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                    <div className="flex flex-col h-full space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 bg-secondary/40 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                {quiz.subject?.icon || '🧪'}
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                              onClick={() => deleteQuiz.mutate(quiz.id)}
                            >
                               <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-1.5">
                            <h4 className="font-heading text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">{quiz.title}</h4>
                            <div className="flex items-center gap-2">
                               <Clock className="h-3 w-3 text-muted-foreground/40" />
                               <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">{new Date(quiz.scheduledDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {quiz.score !== null && (
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                   <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Precision Rating</span>
                                   <span className="font-mono text-xl font-black text-primary">{quiz.score}<span className="text-sm opacity-40 font-normal">/{quiz.totalMarks}</span></span>
                                </div>
                                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-primary transition-all duration-1000" 
                                     style={{ width: `${(quiz.score / quiz.totalMarks) * 100}%` }} 
                                   />
                                </div>
                            </div>
                        )}

                        <div className="pt-4 mt-auto">
                            <button
                              onClick={() => {
                                const nextMap: any = { PENDING: 'DONE', DONE: 'MISSED', MISSED: 'PENDING' };
                                updateQuiz.mutate({ id: quiz.id, status: nextMap[quiz.status] });
                              }}
                              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border flex items-center justify-center gap-3 ${
                                  quiz.status === 'DONE' ? 'bg-success/10 text-success border-success/20 shadow-lg shadow-success/10' : 
                                  quiz.status === 'MISSED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                  'bg-background border-primary/10 text-muted-foreground hover:border-primary/40'
                              }`}
                            >
                              <Award className="h-4 w-4" />
                              {quiz.status}
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
