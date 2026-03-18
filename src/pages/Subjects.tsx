import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REV_LABELS = ['R1', 'R2', 'R3', 'R4', 'R5'];

export default function Subjects() {
  const { subjects, chapters, topics, revisions, addSubject, addChapter, addTopicWithRevisions, deleteSubject, deleteChapter, deleteTopic, toggleLecture } = useStore();
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
    addSubject({ name: subForm.name, icon: subForm.icon, color: subForm.color, startDate: new Date().toISOString().split('T')[0], isActive: true });
    setSubForm({ name: '', icon: '📘', color: '#4f8ef7' });
    setNewSubOpen(false);
  };

  const handleAddChapter = (subjectId: string) => {
    if (!chapForm.name.trim()) return;
    const subChaps = chapters.filter((c) => c.subjectId === subjectId);
    addChapter({ subjectId, name: chapForm.name, orderIndex: subChaps.length, status: 'not_started' });
    setChapForm({ name: '' });
    setNewChapFor(null);
  };

  const handleAddTopic = (subjectId: string, chapterId: string) => {
    if (!topicForm.name.trim()) return;
    const chapTopics = topics.filter((t) => t.chapterId === chapterId);
    addTopicWithRevisions(subjectId, chapterId, topicForm.name, topicForm.dateTaught, chapTopics.length);
    setTopicForm({ name: '', dateTaught: new Date().toISOString().split('T')[0] });
    setNewTopicFor(null);
  };

  const getTopicRevisionStatus = (topicId: string) => {
    const topicRevs = revisions.filter((r) => r.topicId === topicId).sort((a, b) => a.revisionNumber - b.revisionNumber);
    return topicRevs.map((r) => ({ number: r.revisionNumber, done: r.status === 'done' }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Subjects & Curriculum</h1>
          <p className="text-sm text-muted-foreground mt-1">Subject → Chapter → Topic hierarchy</p>
        </div>
        <Dialog open={newSubOpen} onOpenChange={setNewSubOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">New Subject</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. Linear Algebra" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Icon (emoji)</Label>
                  <Input value={subForm.icon} onChange={(e) => setSubForm({ ...subForm, icon: e.target.value })} />
                </div>
                <div className="flex-1">
                  <Label>Color</Label>
                  <Input type="color" value={subForm.color} onChange={(e) => setSubForm({ ...subForm, color: e.target.value })} className="h-10" />
                </div>
              </div>
              <Button onClick={handleAddSubject} className="w-full">Create Subject</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {subjects.filter((s) => s.isActive).map((sub) => {
          const subChaps = chapters.filter((c) => c.subjectId === sub.id).sort((a, b) => a.orderIndex - b.orderIndex);
          const subTopics = topics.filter((t) => t.subjectId === sub.id);
          const lecturesDone = subTopics.filter((t) => t.lectureStatus === 'done').length;
          const isSubOpen = expandedSubs.includes(sub.id);

          return (
            <div key={sub.id} className="bg-card rounded-xl overflow-hidden">
              {/* Subject header */}
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => toggleSub(sub.id)}>
                <span className="text-xl">{sub.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground">{sub.name}</h3>
                  <p className="text-xs text-muted-foreground">{subChaps.length} chapters · {lecturesDone}/{subTopics.length} topics done</p>
                </div>
                <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${subTopics.length > 0 ? (lecturesDone / subTopics.length) * 100 : 0}%`, background: sub.color }} />
                </div>
                {isSubOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>

              {isSubOpen && (
                <div className="border-t border-border">
                  {subChaps.map((chap) => {
                    const chapTopics = topics.filter((t) => t.chapterId === chap.id).sort((a, b) => a.orderIndex - b.orderIndex);
                    const chapDone = chapTopics.filter((t) => t.lectureStatus === 'done').length;
                    const isChapOpen = expandedChaps.includes(chap.id);

                    return (
                      <div key={chap.id} className="border-b border-border/50 last:border-0">
                        {/* Chapter header */}
                        <div className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-secondary/20 transition-colors pl-10" onClick={() => toggleChap(chap.id)}>
                          {isChapOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{chap.name}</p>
                            <p className="text-[10px] text-muted-foreground">{chapDone}/{chapTopics.length} topics</p>
                          </div>
                          <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${chapTopics.length > 0 ? (chapDone / chapTopics.length) * 100 : 0}%`, background: sub.color }} />
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); deleteChapter(chap.id); }} className="text-muted-foreground hover:text-destructive p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Topics */}
                        {isChapOpen && (
                          <div className="bg-secondary/10">
                            {chapTopics.map((topic) => {
                              const revStatus = getTopicRevisionStatus(topic.id);
                              return (
                                <div key={topic.id} className="flex items-center gap-3 px-5 py-2.5 pl-16 hover:bg-secondary/20 transition-colors">
                                  <button onClick={() => toggleLecture(topic.id)} className="shrink-0">
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${topic.lectureStatus === 'done' ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'}`}>L</span>
                                  </button>
                                  <span className="text-sm text-foreground flex-1 min-w-0 truncate">{topic.name}</span>
                                  <div className="flex items-center gap-1">
                                    {revStatus.map((rs) => (
                                      <span key={rs.number} className={`text-[9px] font-mono px-1 py-0.5 rounded ${rs.done ? 'bg-accent/20 text-accent' : 'bg-secondary/50 text-muted-foreground/50'}`}>
                                        R{rs.number}
                                      </span>
                                    ))}
                                  </div>
                                  {topic.dateTaught && <span className="text-[10px] text-muted-foreground">{topic.dateTaught}</span>}
                                  <button onClick={() => deleteTopic(topic.id)} className="text-muted-foreground hover:text-destructive p-1">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              );
                            })}

                            {/* Add topic */}
                            {newTopicFor === chap.id ? (
                              <div className="px-5 py-3 pl-16 flex items-end gap-3 bg-secondary/20">
                                <div className="flex-1">
                                  <Label className="text-xs">Topic Name</Label>
                                  <Input size={1} value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="e.g. Row Echelon Form" className="h-8 text-sm" />
                                </div>
                                <div>
                                  <Label className="text-xs">Date Taught</Label>
                                  <Input type="date" value={topicForm.dateTaught} onChange={(e) => setTopicForm({ ...topicForm, dateTaught: e.target.value })} className="h-8 text-sm" />
                                </div>
                                <Button size="sm" className="h-8" onClick={() => handleAddTopic(sub.id, chap.id)}>Add</Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={() => setNewTopicFor(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <button onClick={() => setNewTopicFor(chap.id)} className="w-full px-5 py-2 pl-16 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/20 transition-colors flex items-center gap-2">
                                <Plus className="h-3 w-3" /> Add topic
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add chapter */}
                  {newChapFor === sub.id ? (
                    <div className="px-5 py-3 pl-10 flex items-end gap-3 bg-secondary/20">
                      <div className="flex-1">
                        <Label className="text-xs">Chapter Name</Label>
                        <Input size={1} value={chapForm.name} onChange={(e) => setChapForm({ ...chapForm, name: e.target.value })} placeholder="e.g. Determinants" className="h-8 text-sm" />
                      </div>
                      <Button size="sm" className="h-8" onClick={() => handleAddChapter(sub.id)}>Add</Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setNewChapFor(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <button onClick={() => setNewChapFor(sub.id)} className="w-full px-5 py-2.5 pl-10 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/20 transition-colors flex items-center gap-2">
                      <Plus className="h-3 w-3" /> Add chapter
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
