import { useSubjects } from "@/hooks/useSubjects";
import { useDashboard } from "@/hooks/useDashboard";
import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Trash2, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Subjects() {
  const { data: subjects, isLoading, addSubject, addChapter, addTopic, deleteChapter, deleteTopic } = useSubjects();
  const { toggleLecture } = useDashboard();

  const [expandedSubs, setExpandedSubs] = useState<string[]>([]);
  const [expandedChaps, setExpandedChaps] = useState<string[]>([]);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [newChapFor, setNewChapFor] = useState<string | null>(null);
  const [newTopicFor, setNewTopicFor] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({ name: '', icon: '📘', color: '#4f8ef7' });
  const [chapForm, setChapForm] = useState({ name: '' });
  const [topicForm, setTopicForm] = useState({ name: '', dateTaught: new Date().toISOString().split('T')[0] });

  const toggleSub = (id: string) => setExpandedSubs((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);
  const toggleChap = (id: string) => setExpandedChaps((e) => e.includes(id) ? e.filter((x) => x !== id) : [...e, id]);

  const handleAddSubject = () => {
    if (!subForm.name.trim()) return;
    addSubject.mutate({ ...subForm, startDate: new Date().toISOString() });
    setSubForm({ name: '', icon: '📘', color: '#4f8ef7' });
    setNewSubOpen(false);
  };

  const handleAddChapter = (subjectId: string, orderIndex: number) => {
    if (!chapForm.name.trim()) return;
    addChapter.mutate({ subjectId, name: chapForm.name, orderIndex });
    setChapForm({ name: '' });
    setNewChapFor(null);
  };

  const handleAddTopic = (chapterId: string, orderIndex: number) => {
    if (!topicForm.name.trim()) return;
    addTopic.mutate({ chapterId, name: topicForm.name, orderIndex, dateTaught: new Date(topicForm.dateTaught).toISOString() });
    setTopicForm({ name: '', dateTaught: new Date().toISOString().split('T')[0] });
    setNewTopicFor(null);
  };

  const handleToggleLecture = (topic: any) => {
    const newStatus = topic.lecture?.status === 'DONE' ? 'PENDING' : 'DONE';
    toggleLecture.mutate({ topicId: topic.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Curriculum</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your exam preparation by subjects</p>
        </div>
        <Dialog open={newSubOpen} onOpenChange={setNewSubOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 rounded-2xl shadow-lg shadow-primary/20 bg-primary h-12 font-bold"><Plus className="h-5 w-5" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-primary/10 shadow-2xl">
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
          const lecturesDone = subTopics.filter((t: any) => t.lecture?.status === 'DONE').length;
          const isSubOpen = expandedSubs.includes(sub.id);
          const progressPercent = subTopics.length > 0 ? (lecturesDone / subTopics.length) * 100 : 0;

          return (
            <div key={sub.id} className="bg-card/50 backdrop-blur-md rounded-3xl overflow-hidden border border-primary/5 shadow-sm hover:border-primary/20 transition-all duration-300">
              {/* Subject header */}
              <div
                className={`flex items-center gap-5 px-6 py-6 cursor-pointer hover:bg-secondary/40 transition-colors ${isSubOpen ? 'bg-secondary/20 border-b border-primary/5' : ''}`}
                onClick={() => toggleSub(sub.id)}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-inner"
                  style={{ background: `${sub.color}15`, color: sub.color, boxShadow: `0 8px 16px -4px ${sub.color}30` }}
                >
                  {sub.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-xl text-foreground">{sub.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{sub.chapters.length} chapters</span>
                    <div className="w-1 h-1 rounded-full bg-secondary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{lecturesDone}/{subTopics.length} lectures completed</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2 px-6">
                  <div className="w-32 h-2 bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-primary/5">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%`, background: sub.color }} />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-muted-foreground opacity-70 tracking-tighter">{Math.round(progressPercent)}% Mastery</span>
                </div>
                <div className={`p-2 rounded-xl bg-secondary/40 text-muted-foreground transition-transform duration-300 ${isSubOpen ? 'rotate-180 bg-primary/10 text-primary' : ''}`}>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>

              {isSubOpen && (
                <div className="divide-y divide-primary/5 bg-background/20">
                  {sub.chapters.map((chap: any, ci: number) => {
                    const isChapOpen = expandedChaps.includes(chap.id);
                    const chapDone = chap.topics.filter((t: any) => t.lecture?.status === 'DONE').length;

                    return (
                      <div key={chap.id} className="relative transition-colors group/chap">
                        {/* Chapter header */}
                        <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => toggleChap(chap.id)}>
                          <div className={`p-1.5 rounded-lg transition-colors ${isChapOpen ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                            {isChapOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground group-hover/chap:text-primary transition-colors">{chap.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">{chapDone}/{chap.topics.length} topics covered</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/chap:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); deleteChapter.mutate(chap.id); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Topics */}
                        {isChapOpen && (
                          <div className="bg-secondary/10 pb-4">
                            <div className="mx-6 p-1 bg-background/40 border border-primary/5 rounded-2xl space-y-1">
                              {chap.topics.map((topic: any) => (
                                <div key={topic.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-background/80 transition-all group/topic border border-transparent hover:border-primary/10">
                                  <button onClick={() => handleToggleLecture(topic)} className="shrink-0 transition-transform group-hover/topic:scale-110">
                                    {topic.lecture?.status === 'DONE' ? (
                                      <CheckCircle2 className="h-5 w-5 text-success" />
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-primary/20 group-hover/topic:border-primary/40" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${topic.lecture?.status === 'DONE' ? 'text-muted-foreground line-through font-normal' : 'text-foreground'}`}>
                                      {topic.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      {topic.revisions?.map((r: any) => (
                                        <span key={r.id} className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${r.status === 'DONE' ? 'bg-accent/20 text-accent font-bold' : 'bg-secondary text-muted-foreground/40'}`}>
                                          R{r.revisionNumber}
                                        </span>
                                      ))}
                                      {topic.dateTaught && (
                                        <span className="text-[9px] font-bold text-muted-foreground opacity-50 ml-auto">
                                          {new Date(topic.dateTaught).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/topic:opacity-100 transition-opacity"
                                    onClick={() => deleteTopic.mutate(topic.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}

                              {/* Add topic */}
                              {newTopicFor === chap.id ? (
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
                                    <Button size="sm" className="h-9 font-bold px-6 rounded-lg" onClick={() => handleAddTopic(chap.id, chap.topics.length)}>Add Topic</Button>
                                    <Button size="sm" variant="ghost" className="h-9 rounded-lg px-6" onClick={() => setNewTopicFor(null)}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setNewTopicFor(chap.id)} className="w-full py-3 text-xs font-bold text-primary/60 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 border-2 border-dashed border-primary/5 rounded-xl mt-2">
                                  <Plus className="h-4 w-4" /> Add Topic to {chap.name}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add chapter */}
                  {newChapFor === sub.id ? (
                    <div className="p-6 bg-secondary/20 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 border-t border-primary/5">
                      <div className="space-y-1.5 max-w-md">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chapter Name</Label>
                        <Input className="h-10 rounded-xl" value={chapForm.name} onChange={(e) => setChapForm({ ...chapForm, name: e.target.value })} placeholder="e.g. Calculus of Variations" />
                      </div>
                      <div className="flex gap-2">
                        <Button className="h-10 px-6 font-bold rounded-xl shadow-lg shadow-primary/10" onClick={() => handleAddChapter(sub.id, sub.chapters.length)}>Create Chapter</Button>
                        <Button variant="ghost" className="h-10 px-6 rounded-xl" onClick={() => setNewChapFor(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setNewChapFor(sub.id)} className="w-full py-4 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-secondary/40 transition-all flex items-center justify-center gap-2 uppercase tracking-widest bg-secondary/10">
                      <Plus className="h-4 w-4" /> Add new chapter
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {subjects?.length === 0 && (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-primary/20">
            <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">📚</div>
            <h3 className="font-heading text-2xl font-bold text-foreground">Welcome to GATE Tracker</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-medium">Create your first subject to start organizing your study material and tracking progress.</p>
            <Button size="lg" className="mt-8 rounded-2xl px-10 h-12 font-bold shadow-xl shadow-primary/20" onClick={() => setNewSubOpen(true)}>Get Started</Button>
          </div>
        )}
      </div>
    </div>
  );
}
