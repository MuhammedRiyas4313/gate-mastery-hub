import { useDPPs } from "@/hooks/useDPPs";
import { useSubjects } from "@/hooks/useSubjects";
import { useMemo, useState } from "react";
import { Filter, Loader2, CheckCircle2, Circle, Clock, MoreVertical, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-primary/5 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-0.5 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">Protocol Feed</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
           </div>
           <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">Daily Practice Problems</h1>
           <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-sm mx-auto md:mx-0 leading-relaxed">Precision practice for target-based learning modules</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1">
               <select 
                 value={filterSubject} 
                 onChange={(e) => setFilterSubject(e.target.value)} 
                 className="w-full bg-card/40 backdrop-blur-md text-[10px] md:text-xs font-bold text-foreground border border-primary/10 rounded-2xl px-5 h-12 md:h-11 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
               >
                   <option value="all">All Modules</option>
                   {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.name || s.id}</option>)}
               </select>
               <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
            </div>
            <div className="relative flex-1">
               <select 
                 value={filterStatus} 
                 onChange={(e) => setFilterStatus(e.target.value)} 
                 className="w-full bg-card/40 backdrop-blur-md text-[10px] md:text-xs font-bold text-foreground border border-primary/10 rounded-2xl px-5 h-12 md:h-11 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
               >
                   <option value="all">All Status</option>
                   <option value="PENDING">Pending Action</option>
                   <option value="DONE">Completed Sessions</option>
                   <option value="SKIPPED">Omitted Nodes</option>
               </select>
               <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 pointer-events-none" />
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Papers Total', value: stats.total, color: 'text-foreground', icon: '📄' },
          { label: 'Completed', value: stats.done, color: 'text-success', icon: '✅' },
          { label: 'Active Streak', value: `${stats.streak}d`, color: 'text-primary', icon: '🔥' },
          { label: 'Progress Rate', value: `${stats.rate}%`, color: 'text-accent', icon: '📈' },
        ].map((s) => (
          <div key={s.label} className="bg-card/30 backdrop-blur-md border border-primary/5 rounded-[2rem] p-5 md:p-6 shadow-sm text-center space-y-2 group hover:border-primary/20 transition-all duration-500">
             <div className="text-2xl md:text-3xl mb-2 opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700">{s.icon}</div>
             <p className={`font-mono text-2xl md:text-3xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
             <p className="text-[10px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none opacity-40">{s.label}</p>
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
              <div key={dpp.id} className={`group relative bg-card/10 backdrop-blur-xl rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isToday ? 'border-primary/40 bg-card/20 shadow-2xl shadow-primary/5' : 'border-primary/5 hover:border-primary/20 shadow-sm'}`}>
                <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5 text-left">
                             <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center transition-all duration-700 shadow-inner group-hover:scale-110 ${dpp.status === 'DONE' ? 'bg-success/10 text-success' : 'bg-primary/20 text-primary'}`}>
                                {dpp.status === 'DONE' ? <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8" /> : <Clock className="h-7 w-7 md:h-8 md:w-8" />}
                             </div>
                             <div className="space-y-1">
                                <h4 className="font-heading text-xl md:text-2xl font-black text-foreground leading-none">{dateLabel}</h4>
                                {isToday && (
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">Target Manifest</span>
                                      <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                                   </div>
                                )}
                             </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-5 w-full lg:w-auto pt-2 lg:pt-0">
                            {!isEditing && dpp.score !== null && (
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center px-4 md:px-6 py-3 md:py-0 bg-primary/5 md:bg-transparent rounded-2xl border border-primary/5 md:border-none">
                                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.1em] mb-0.5">Performance index</span>
                                    <div className="flex items-baseline gap-1">
                                       <span className="font-mono text-2xl md:text-3xl font-black text-primary leading-none">{dpp.score}</span>
                                       <span className="font-mono text-xs md:text-sm opacity-30 font-bold">/{dpp.totalMarks}</span>
                                    </div>
                                </div>
                            )}
                            <Button 
                              size="lg"
                              variant={dpp.status === 'DONE' ? 'secondary' : 'default'}
                              className={`h-14 md:h-16 px-10 rounded-2xl md:rounded-[1.5rem] font-black tracking-widest text-[11px] transition-all duration-300 transform active:scale-95 shadow-xl ${dpp.status === 'DONE' ? 'bg-success/5 text-success border border-success/20 hover:bg-success/10' : 'shadow-primary/30 bg-primary hover:bg-primary/90'}`}
                              onClick={() => handleToggleStatus(dpp)}
                            >
                                {dpp.status === 'DONE' ? 'ANALYSIS COMPLETED' : 'SYNCHRONIZE SESSION'}
                            </Button>
                        </div>
                    </div>

                    {/* Auto-tags */}
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {dpp.tags.map((tag: any, i: number) => (
                           <div key={i} className="flex items-center gap-2 md:gap-3 bg-primary/5 border border-primary/10 px-4 py-2 rounded-xl group/tag hover:bg-primary/10 transition-colors">
                              <span className="text-lg md:text-xl group-hover/tag:scale-110 transition-transform">{tag.subject?.icon || '🔬'}</span>
                              <span className="text-[10px] md:text-[11px] font-black text-muted-foreground uppercase tracking-wider">{tag.topic?.name}</span>
                           </div>
                        ))}
                    </div>

                    {/* Editor Panel */}
                    {isEditing ? (
                        <div className="bg-background/80 p-5 md:p-6 rounded-2xl border border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-300 relative z-20">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
