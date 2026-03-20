import { useDPPs } from "@/hooks/useDPPs";
import { useSubjects } from "@/hooks/useSubjects";
import { useMemo, useState } from "react";
import { Filter, Loader2, CheckCircle2, Circle, Clock, MoreVertical, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DPPPage() {
  const { data: dpps, isLoading, updateDPP } = useDPPs();
  const { data: subjects } = useSubjects();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ score: 0, totalMarks: 10, notes: '' });

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    if (!dpps) return [];
    let list = [...dpps].sort((a, b) => b.date.localeCompare(a.date));
    if (filterStatus !== 'all') list = list.filter((d) => d.status === filterStatus);
    if (filterSubject !== 'all') {
        list = list.filter((d) => d.tags.some((t: any) => t.subject?.id === filterSubject));
    }
    return list;
  }, [dpps, filterStatus, filterSubject]);

  const stats = useMemo(() => {
    if (!dpps) return { total: 0, done: 0, streak: 0, rate: 0 };
    const done = dpps.filter((d: any) => d.status === 'DONE');
    
    // Simple streak calculation
    const sortedDone = [...done].map((d: any) => d.date.split('T')[0]).sort().reverse();
    let streakCount = 0;
    let curr = new Date();
    for (const d of sortedDone) {
        if (d === curr.toISOString().split('T')[0]) {
            streakCount++;
            curr.setDate(curr.getDate() - 1);
        } else if (d < curr.toISOString().split('T')[0]) break;
    }

    return {
      total: dpps.length,
      done: done.length,
      streak: streakCount,
      rate: dpps.length > 0 ? Math.round((done.length / dpps.length) * 100) : 0
    };
  }, [dpps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  const handleToggleStatus = (dpp: any) => {
    const newStatus = dpp.status === 'DONE' ? 'PENDING' : 'DONE';
    updateDPP.mutate({ id: dpp.id, status: newStatus });
  };

  const startEditing = (dpp: any) => {
    setEditingId(dpp.id);
    setEditForm({ score: dpp.score || 0, totalMarks: dpp.totalMarks || 10, notes: dpp.notes || '' });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateDPP.mutate({ id: editingId, ...editForm });
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">DPP Mastery</h1>
          <p className="text-sm text-muted-foreground mt-1">Consistency is key. One daily practice paper at a time.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
            <select 
              value={filterSubject} 
              onChange={(e) => setFilterSubject(e.target.value)} 
              className="bg-card/50 backdrop-blur-sm text-xs font-bold text-foreground border border-primary/10 rounded-xl px-4 h-10 appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
            >
                <option value="all">All Subjects</option>
                {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="bg-card/50 backdrop-blur-sm text-xs font-bold text-foreground border border-primary/10 rounded-xl px-4 h-10 appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
            >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="DONE">Completed</option>
                <option value="SKIPPED">Skipped</option>
            </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Papers Total', value: stats.total, color: 'text-foreground', icon: '📄' },
          { label: 'Completed', value: stats.done, color: 'text-success', icon: '✅' },
          { label: 'Active Streak', value: `${stats.streak}d`, color: 'text-primary', icon: '🔥' },
          { label: 'Completion Rate', value: `${stats.rate}%`, color: 'text-accent', icon: '📈' },
        ].map((s) => (
          <div key={s.label} className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-3xl p-5 shadow-sm text-center space-y-1 group hover:border-primary/20 transition-all">
             <div className="text-xl mb-1 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{s.icon}</div>
             <p className={`font-mono text-2xl font-black ${s.color}`}>{s.value}</p>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* DPP list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-[2.5rem] border border-dashed border-primary/10">
            <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">📋</div>
            <h3 className="font-heading text-xl font-bold">No records matched</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Try adjusting your filters or complete today's session to generate a new DPP.</p>
          </div>
        ) : (
          filtered.map((dpp: any) => {
            const dateLabel = new Date(dpp.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
            const isToday = dpp.date.split('T')[0] === todayStr;
            const isEditing = editingId === dpp.id;

            return (
              <div key={dpp.id} className={`group relative bg-card/50 backdrop-blur-sm rounded-[2rem] border transition-all duration-300 overflow-hidden ${isToday ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-primary/5 hover:border-primary/20'}`}>
                <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-2xl flex items-center justify-center transition-colors ${dpp.status === 'DONE' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                                {dpp.status === 'DONE' ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                             </div>
                             <div>
                                <h4 className="font-heading text-lg font-bold text-foreground leading-tight">{dateLabel}</h4>
                                {isToday && <span className="text-[10px] font-black text-primary tracking-widest uppercase">Current Assignment</span>}
                             </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isEditing && dpp.score !== null && (
                                <div className="hidden sm:flex flex-col items-end px-4">
                                    <span className="text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-tighter">Performance</span>
                                    <p className="font-mono text-xl font-black text-primary">{dpp.score}<span className="text-sm opacity-50 font-normal">/{dpp.totalMarks}</span></p>
                                </div>
                            )}
                            <Button 
                              size="lg"
                              variant={dpp.status === 'DONE' ? 'secondary' : 'default'}
                              className={`h-11 px-8 rounded-2xl font-black transition-all shadow-lg ${dpp.status === 'DONE' ? 'bg-success/10 text-success border-success/10 hover:bg-success/20' : 'shadow-primary/20'}`}
                              onClick={() => handleToggleStatus(dpp)}
                            >
                                {dpp.status === 'DONE' ? 'MASTERED' : 'MARK DONE'}
                            </Button>
                        </div>
                    </div>

                    {/* Auto-tags */}
                    <div className="flex flex-wrap gap-2">
                        {dpp.tags.map((tag: any, i: number) => (
                           <div key={i} className="flex items-center gap-2 bg-background/50 border border-primary/5 px-3 py-1.5 rounded-xl">
                              <span className="text-base">{tag.subject?.icon}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{tag.topic?.name}</span>
                           </div>
                        ))}
                    </div>

                    {/* Editor Panel */}
                    {isEditing ? (
                        <div className="bg-background/80 p-6 rounded-2xl border border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-300">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest">Score Obtained</Label>
                                    <Input 
                                      type="number" 
                                      className="h-11 rounded-xl font-mono text-lg" 
                                      value={editForm.score} 
                                      onChange={(e) => setEditForm({ ...editForm, score: Number(e.target.value) })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest">Maximum Marks</Label>
                                    <Input 
                                      type="number" 
                                      className="h-11 rounded-xl font-mono text-lg" 
                                      value={editForm.totalMarks} 
                                      onChange={(e) => setEditForm({ ...editForm, totalMarks: Number(e.target.value) })} 
                                    />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Post-Session Notes</Label>
                                <Textarea 
                                  className="rounded-2xl min-h-[100px] border-primary/10" 
                                  placeholder="Mistakes made, key observations..." 
                                  value={editForm.notes} 
                                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} 
                                />
                             </div>
                             <div className="flex gap-2">
                                <Button className="flex-1 h-11 rounded-xl font-bold" onClick={handleSaveEdit} disabled={updateDPP.isPending}>
                                    <Save className="h-4 w-4 mr-2" /> Save Results
                                </Button>
                                <Button variant="ghost" className="h-11 rounded-xl px-6" onClick={() => setEditingId(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                    ) : (
                        dpp.notes && (
                            <div className="bg-secondary/20 p-5 rounded-2xl border border-primary/5">
                                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Reflections</p>
                                <p className="text-sm text-foreground/80 font-medium italic">"{dpp.notes}"</p>
                            </div>
                        )
                    )}

                    {!isEditing && (
                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={() => startEditing(dpp)}
                                className="flex items-center gap-1.5 text-[10px] font-black text-primary/60 hover:text-primary tracking-widest uppercase transition-colors"
                            >
                                <Edit3 className="h-3 w-3" /> Edit performance data
                            </button>
                        </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
