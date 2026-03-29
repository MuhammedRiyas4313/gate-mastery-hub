import { useSubjects } from "@/hooks/useSubjects";
import { useDashboard } from "@/hooks/useDashboard";
import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Trash2, Loader2, BookOpen, CheckCircle2, MoreVertical, AlertTriangle, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const STATUS_COLORS = {
  pending: 'text-muted-foreground bg-secondary/30',
  ongoing: 'text-primary bg-primary/10',
  complete: 'text-success bg-success/10'
};

export default function Subjects() {
  const { 
    data: subjects, isLoading, 
    addSubject, updateSubject, deleteSubject,
    addChapter, updateChapter, deleteChapter,
    addTopic, updateTopic, deleteTopic 
  } = useSubjects();
  const { toggleLecture } = useDashboard();

  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);
  const [expandedChaps, setExpandedChaps] = useState<string[]>([]);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [newChapFor, setNewChapFor] = useState<string | null>(null);
  const [newTopicFor, setNewTopicFor] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({ name: '', icon: '📘', color: '#4f8ef7' });
  const [chapForm, setChapForm] = useState({ name: '' });
  const [topicForm, setTopicForm] = useState({ name: '', dateTaught: new Date().toISOString().split('T')[0] });

  // Edit states
  const [editSubOpen, setEditSubOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubForm, setEditSubForm] = useState({ name: '', icon: '📘', color: '#4f8ef7' });

  const [editChapOpen, setEditChapOpen] = useState(false);
  const [editingChapId, setEditingChapId] = useState<string | null>(null);
  const [editChapForm, setEditChapForm] = useState({ name: '' });

  const [editTopicOpen, setEditTopicOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicForm, setEditTopicForm] = useState({ name: '', dateTaught: '' });

  // Delete Confirmation State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'subject'|'chapter'|'topic', id: string, name: string } | null>(null);

  const toggleSub = (id: string) => setExpandedSubs((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);
  const toggleChap = (id: string) => setExpandedChaps((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);

  const handleAddSubject = () => {
    if (!subForm.name.trim()) return;
    addSubject.mutate({ ...subForm, startDate: new Date().toISOString() });
    setSubForm({ name: '', icon: '📘', color: '#4f8ef7' });
    setNewSubOpen(false);
  };

  const handleEditSubject = (sub: any) => {
    setEditingSubId(sub._id);
    setEditSubForm({ name: sub.name, icon: sub.icon || '📘', color: sub.color || '#4f8ef7' });
    setEditSubOpen(true);
  };

  const handleEditChapter = (chap: any) => {
    setEditingChapId(chap._id);
    setEditChapForm({ name: chap.name });
    setEditChapOpen(true);
  };

  const handleEditTopic = (topic: any) => {
    setEditingTopicId(topic._id);
    setEditTopicForm({ name: topic.name, dateTaught: topic.dateTaught?.split('T')[0] || '' });
    setEditTopicOpen(true);
  };

  const submitEditSubject = () => {
    if (!editingSubId || !editSubForm.name.trim()) return;
    updateSubject.mutate({ id: editingSubId, ...editSubForm });
    setEditSubOpen(false);
  };

  const submitEditChapter = () => {
    if (!editingChapId || !editChapForm.name.trim()) return;
    updateChapter.mutate({ id: editingChapId, ...editChapForm });
    setEditChapOpen(false);
  };

  const submitEditTopic = () => {
    if (!editingTopicId || !editTopicForm.name.trim()) return;
    updateTopic.mutate({ id: editingTopicId, ...editTopicForm });
    setEditTopicOpen(false);
  };

  const handleAddChapter = (subjectId: string, orderIndex: number) => {
    if (!chapForm.name.trim()) return;
    addChapter.mutate({ subjectId, name: chapForm.name, orderIndex });
    setChapForm({ name: '' });
    setNewChapFor(null);
  };

  const handleAddTopic = (chapterId: string, orderIndex: number, subjectId: string) => {
    if (!topicForm.name.trim()) return;
    addTopic.mutate({ chapterId, name: topicForm.name, orderIndex, dateTaught: new Date(topicForm.dateTaught).toISOString(), subjectId });
    setTopicForm({ name: '', dateTaught: new Date().toISOString().split('T')[0] });
    setNewTopicFor(null);
  };

  const handleStatusUpdate = (type: 'subject'|'chapter'|'topic', id: string, status: string) => {
    if (type === 'subject') updateSubject.mutate({ id, status });
    if (type === 'chapter') updateChapter.mutate({ id, status });
    if (type === 'topic') updateTopic.mutate({ id, status });
  };

  const triggerDelete = (type: 'subject'|'chapter'|'topic', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setConfirmDeleteOpen(true);
  };

  const confirmDeletion = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    if (type === 'subject') deleteSubject.mutate(id);
    if (type === 'chapter') deleteChapter.mutate(id);
    if (type === 'topic') deleteTopic.mutate(id);
    setConfirmDeleteOpen(false);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 px-4 md:px-0 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Curriculum</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Organize your exam preparation by subjects</p>
        </div>
        <Dialog open={newSubOpen} onOpenChange={setNewSubOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full sm:w-auto gap-2 rounded-2xl shadow-lg shadow-primary/20 bg-primary h-12 font-bold px-6"><Plus className="h-5 w-5" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-primary/10 shadow-2xl max-w-[95vw] sm:max-w-lg">
            <DialogHeader><DialogTitle className="font-heading text-2xl font-bold text-foreground">New Subject</DialogTitle></DialogHeader>
            <div className="space-y-5 pt-4">
              <div>
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Subject Name</Label>
                <Input className="h-12 rounded-xl mt-1.5 bg-secondary/50 border-primary/5 focus-visible:ring-primary" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Discrete Mathematics" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Icon (emoji)</Label>
                  <Input className="h-12 rounded-xl mt-1.5 bg-secondary/50 border-primary/5 text-center text-2xl" value={subForm.icon} onChange={(e) => setSubForm({ ...subForm, icon: e.target.value })} />
                </div>
                <div>
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Accent Color</Label>
                  <Input type="color" value={subForm.color} onChange={(e) => setSubForm({ ...subForm, color: e.target.value })} className="h-12 rounded-xl mt-1.5 bg-secondary/50 border-primary/5 p-1 cursor-pointer" />
                </div>
              </div>
              <Button onClick={handleAddSubject} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 mt-4" disabled={addSubject.isPending}>
                {addSubject.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Subject
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {subjects?.map((sub: any) => {
          const subTopics = sub.chapters.flatMap((c: any) => c.topics);
          const topicsDone = subTopics.filter((t: any) => t.status === 'complete').length;
          const isSubOpen = expandedSubs.includes(sub._id);
          const progressPercent = subTopics.length > 0 ? (topicsDone / subTopics.length) * 100 : 0;

          return (
            <div key={sub._id} className="bg-card/50 backdrop-blur-md rounded-3xl overflow-hidden border border-primary/5 shadow-sm hover:border-primary/20 transition-all duration-300">
              <div className={`flex items-center gap-3 md:gap-5 px-4 md:px-6 py-4 md:py-6 cursor-pointer hover:bg-secondary/40 transition-colors group ${isSubOpen ? 'bg-secondary/20 border-b border-primary/5' : ''}`} onClick={() => toggleSub(sub._id)}>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center text-2xl md:text-3xl shadow-lg" style={{ background: `${sub.color}15`, color: sub.color, boxShadow: `0 8px 16px -4px ${sub.color}30` }}>
                  {sub.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-lg md:text-xl text-foreground truncate">{sub.name}</h3>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className={`w-fit text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[sub.status as keyof typeof STATUS_COLORS]}`}>{sub.status}</button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent className="rounded-2xl border-primary/10 p-2 min-w-[160px]">
                          <DropdownMenuItem onClick={() => handleStatusUpdate('subject', sub._id, 'pending')} className="rounded-xl font-bold py-2">Pending</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate('subject', sub._id, 'ongoing')} className="rounded-xl font-bold py-2">Ongoing</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate('subject', sub._id, 'complete')} className="rounded-xl font-bold py-2">Complete</DropdownMenuItem>
                          <div className="h-px bg-muted mx-1 my-1" />
                          <DropdownMenuItem onClick={() => triggerDelete('subject', sub._id, sub.name)} className="rounded-xl font-bold py-2 text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); handleEditSubject(sub); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); triggerDelete('subject', sub._id, sub.name); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-1.5">
                    <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{sub.chapters.length} chapters</span>
                    <div className="w-1 h-1 rounded-full bg-secondary" />
                    <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{topicsDone}/{subTopics.length} topics done</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2 px-6 shrink-0">
                  <div className="w-32 h-2 bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-primary/5">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, background: sub.color }} />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-muted-foreground opacity-70 tracking-tighter">{Math.round(progressPercent)}% Mastery</span>
                </div>
                <div className={`p-1.5 md:p-2 rounded-xl bg-secondary/40 text-muted-foreground transition-transform duration-300 shrink-0 ${isSubOpen ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                </div>
              </div>
              {isSubOpen && (
                <div className="divide-y divide-primary/5 bg-background/20">
                  {sub.chapters.map((chap: any) => {
                    const isChapOpen = expandedChaps.includes(chap._id);
                    const chapDone = chap.topics.filter((t: any) => t.status === 'complete').length;
                    return (
                      <div key={chap._id} className="relative transition-colors group/chap">
                        <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => toggleChap(chap._id)}>
                          <div className={`p-1.5 rounded-lg transition-colors shrink-0 ${isChapOpen ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                            {isChapOpen ? <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs md:text-sm font-bold text-foreground group-hover/chap:text-primary transition-colors truncate">{chap.name}</p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <button className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[chap.status as keyof typeof STATUS_COLORS]}`}>{chap.status}</button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate('chapter', chap._id, 'pending')}>Pending</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate('chapter', chap._id, 'ongoing')}>Ongoing</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate('chapter', chap._id, 'complete')}>Complete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">{chapDone}/{chap.topics.length} topics</p>
                          </div>
                          <div className="flex items-center gap-1 sm:opacity-0 group-hover/chap:opacity-100 transition-opacity shrink-0">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); handleEditChapter(chap); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); triggerDelete('chapter', chap._id, chap.name); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {isChapOpen && (
                          <div className="bg-secondary/10 pb-4">
                            <div className="mx-3 md:mx-6 p-1 bg-background/40 border border-primary/5 rounded-2xl space-y-1">
                              {chap.topics.map((topic: any) => (
                                <div key={topic._id} className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl hover:bg-background/80 transition-all group/topic border border-transparent hover:border-primary/10">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="shrink-0 transition-transform group-hover/topic:scale-110">
                                        {topic.status === 'complete' ? <CheckCircle2 className="h-4.5 w-4.5 md:h-5 md:w-5 text-success" /> : topic.status === 'ongoing' ? <div className="h-4.5 w-4.5 md:h-5 md:w-5 rounded-full border-2 border-primary bg-primary/20 animate-pulse" /> : <div className="h-4.5 w-4.5 md:h-5 md:w-5 rounded-full border-2 border-primary/20 group-hover/topic:border-primary/40" />}
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleStatusUpdate('topic', topic._id, 'pending')}>Pending</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusUpdate('topic', topic._id, 'ongoing')}>Ongoing</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleStatusUpdate('topic', topic._id, 'complete')}>Complete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs md:text-sm font-semibold truncate ${topic.status === 'complete' ? 'text-muted-foreground line-through font-normal' : 'text-foreground'}`}>{topic.name}</p>
                                    <div className="flex items-center gap-2">
                                      {topic.revisions?.map((r: any) => <span key={r.id} className={`text-[7px] md:text-[8px] font-mono px-1.5 py-0.5 rounded ${r.status === 'complete' ? 'bg-accent/20 text-accent font-bold' : 'bg-secondary text-muted-foreground/40'}`}>R{r.revisionNumber}</span>)}
                                      {topic.dateTaught && <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground opacity-50 ml-auto shrink-0">{new Date(topic.dateTaught).toLocaleDateString()}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 sm:opacity-0 group-hover/topic:opacity-100 transition-opacity shrink-0">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleEditTopic(topic)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => triggerDelete('topic', topic._id, topic.name)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {newTopicFor === chap._id ? (
                                <div className="p-4 rounded-xl bg-background/60 border border-primary/10 m-1 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topic Title</Label>
                                      <Input className="h-9 rounded-lg" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="e.g. Eigenvalues & Properties" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date Taught</Label>
                                      <Input type="date" className="h-9 rounded-lg" value={topicForm.dateTaught} onChange={(e) => setTopicForm({ ...topicForm, dateTaught: e.target.value })} />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" className="h-9 font-bold px-6 rounded-lg" onClick={() => handleAddTopic(chap._id, chap.topics.length, sub._id)}>Add Topic</Button>
                                    <Button size="sm" variant="ghost" className="h-9 rounded-lg px-6" onClick={() => setNewTopicFor(null)}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setNewTopicFor(chap._id)} className="w-full py-3 text-xs font-bold text-primary/60 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 border-2 border-dashed border-primary/5 rounded-xl mt-2">
                                  <Plus className="h-4 w-4" /> Add Topic to {chap.name}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {newChapFor === sub._id ? (
                    <div className="p-6 bg-secondary/20 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 border-t border-primary/5">
                      <div className="space-y-1.5 max-w-md">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chapter Name</Label>
                        <Input className="h-10 rounded-xl" value={chapForm.name} onChange={(e) => setChapForm({ ...chapForm, name: e.target.value })} placeholder="e.g. Calculus of Variations" />
                      </div>
                      <div className="flex gap-2">
                        <Button className="h-10 px-6 font-bold rounded-xl shadow-lg shadow-primary/10" onClick={() => handleAddChapter(sub._id, sub.chapters.length)}>Create Chapter</Button>
                        <Button variant="ghost" className="h-10 px-6 rounded-xl" onClick={() => setNewChapFor(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setNewChapFor(sub._id)} className="w-full py-4 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all flex items-center justify-center gap-2 uppercase tracking-widest bg-secondary/10"><Plus className="h-4 w-4" /> Add new chapter</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-primary/10 p-10 max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <AlertDialogTitle className="font-heading text-2xl md:text-3xl font-black text-left leading-tight">
                {deleteTarget?.type === 'subject' && 'Purge Subject?'}
                {deleteTarget?.type === 'chapter' && 'Remove Chapter?'}
                {deleteTarget?.type === 'topic' && 'Delete Topic?'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-muted-foreground pt-1 leading-relaxed text-left">
              You are about to delete <span className="text-foreground font-bold">"{deleteTarget?.name}"</span>. This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-4">
            <AlertDialogCancel className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[11px] border-primary/5">Wait, Abort</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletion} className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20">Yes, Delete Permanent</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editSubOpen} onOpenChange={setEditSubOpen}>
        <DialogContent className="rounded-3xl border-primary/10 shadow-2xl max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-2xl font-bold">Edit Subject</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><Label className="font-bold text-xs uppercase text-muted-foreground">Subject Name</Label><Input className="h-12 rounded-xl mt-1.5" value={editSubForm.name} onChange={(e) => setEditSubForm({ ...editSubForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="font-bold text-xs uppercase text-muted-foreground">Icon</Label><Input className="h-12 rounded-xl mt-1.5 text-center text-2xl" value={editSubForm.icon} onChange={(e) => setEditSubForm({ ...editSubForm, icon: e.target.value })} /></div>
              <div><Label className="font-bold text-xs uppercase text-muted-foreground">Accent Color</Label><Input type="color" value={editSubForm.color} onChange={(e) => setEditSubForm({ ...editSubForm, color: e.target.value })} className="h-12 rounded-xl mt-1.5 p-1 cursor-pointer" /></div>
            </div>
            <Button onClick={submitEditSubject} className="w-full h-12 rounded-xl font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editChapOpen} onOpenChange={setEditChapOpen}>
        <DialogContent className="rounded-3xl border-primary/10 shadow-2xl max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-2xl font-bold">Edit Chapter</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><Label className="font-bold text-xs uppercase text-muted-foreground">Chapter Name</Label><Input className="h-12 rounded-xl mt-1.5 font-bold" value={editChapForm.name} onChange={(e) => setEditChapForm({ ...editChapForm, name: e.target.value })} /></div>
            <Button onClick={submitEditChapter} className="w-full h-12 rounded-xl font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editTopicOpen} onOpenChange={setEditTopicOpen}>
        <DialogContent className="rounded-3xl border-primary/10 shadow-2xl max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-2xl font-bold">Edit Topic</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><Label className="font-bold text-xs uppercase text-muted-foreground">Topic Title</Label><Input className="h-12 rounded-xl mt-1.5 font-bold" value={editTopicForm.name} onChange={(e) => setEditTopicForm({ ...editTopicForm, name: e.target.value })} /></div>
            <div><Label className="font-bold text-xs uppercase text-muted-foreground">Date Taught</Label><Input type="date" className="h-12 rounded-xl mt-1.5 font-bold" value={editTopicForm.dateTaught} onChange={(e) => setEditTopicForm({ ...editTopicForm, dateTaught: e.target.value })} /></div>
            <Button onClick={submitEditTopic} className="w-full h-12 rounded-xl font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

