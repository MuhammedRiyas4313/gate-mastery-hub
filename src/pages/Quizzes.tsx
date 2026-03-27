import { useQuizSessions } from "@/hooks/useQuizSessions";
import { useSubjects } from "@/hooks/useSubjects";
import { useState, useMemo } from "react";
import { Plus, Loader2, Save, Trash2, CalendarDays, Zap, Target, BookOpen, Tag, Edit3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { toast } from "sonner";

export default function Quizzes() {
  const { data: sessions, isLoading, addSession, updateSession, deleteSession } = useQuizSessions();
  const { data: subjects } = useSubjects();

  // ── Session state ────────────────────────────────────────────────────────
  const [deleteSessionOpen, setDeleteSessionOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING'
  });

  // ── Quiz internal item state ─────────────────────────────────────────────
  const [quizItemOpen, setQuizItemOpen] = useState(false);
  const [targetSession, setTargetSession] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '', score: '', totalMarks: '100', notes: '', status: 'PENDING',
    subjectId: 'all', chapterId: 'all', topicId: 'all'
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers – Session
  // ─────────────────────────────────────────────────────────────────────────
  const handleCreateSession = () => {
    const d = parseISO(newSessionForm.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    addSession.mutate({ date: newSessionForm.date, status: newSessionForm.status, dayName }, {
      onSuccess: () => {
        setCreateOpen(false);
        toast.success("Quiz session created");
      }
    });
  };

  const cycleSessionStatus = (e: any, session: any) => {
    e.stopPropagation();
    const next = session.status === 'PENDING' ? 'ONGOING' : session.status === 'ONGOING' ? 'COMPLETED' : 'PENDING';
    updateSession.mutate({ id: session._id, status: next }, {
      onSuccess: () => toast.success(`Session marked ${next}`),
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Cloud sync error";
        toast.error(msg);
      }
    });
  };

  const handleDeleteSessionClick = (session: any) => {
    setSessionToDelete(session);
    setDeleteSessionOpen(true);
  };

  const confirmDeleteSession = () => {
    if (!sessionToDelete) return;
    deleteSession.mutate(sessionToDelete._id, {
      onSuccess: () => {
        setDeleteSessionOpen(false);
        setSessionToDelete(null);
        toast.success("Session deleted");
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers – Quiz Items (Add/Edit)
  // ─────────────────────────────────────────────────────────────────────────
  const openAddQuizItem = (session: any) => {
    setTargetSession(session);
    setEditingIndex(null);
    setQuizForm({ 
      title: '', score: '0', totalMarks: '100', notes: '', status: 'PENDING',
      subjectId: 'all', chapterId: 'all', topicId: 'all'
    });
    setQuizItemOpen(true);
  };

  const openEditQuizItem = (session: any, index: number) => {
    setTargetSession(session);
    setEditingIndex(index);
    const quiz = session.quizzes[index];
    setQuizForm({
      title: quiz.title || '',
      score: String(quiz.score || 0),
      totalMarks: String(quiz.totalMarks || 100),
      notes: quiz.notes || '',
      status: quiz.status || 'PENDING',
      subjectId: quiz.subject?._id || quiz.subject || 'all',
      chapterId: quiz.chapter?._id || quiz.chapter || 'all',
      topicId: quiz.topic?._id || quiz.topic || 'all'
    });
    setQuizItemOpen(true);
  };

  const handleSaveQuizItem = () => {
    if (!targetSession || !quizForm.title.trim()) return;
    
    const updatedQuizzes = [...targetSession.quizzes];
    const quizData = {
      title: quizForm.title,
      score: Number(quizForm.score) || 0,
      totalMarks: Number(quizForm.totalMarks) || 100,
      notes: quizForm.notes,
      subject: quizForm.subjectId !== 'all' ? quizForm.subjectId : undefined,
      chapter: quizForm.chapterId !== 'all' ? quizForm.chapterId : undefined,
      topic: quizForm.topicId !== 'all' ? quizForm.topicId : undefined,
      status: quizForm.status
    };

    if (editingIndex !== null) {
      updatedQuizzes[editingIndex] = quizData;
    } else {
      updatedQuizzes.push(quizData);
    }

    updateSession.mutate({ id: targetSession._id, quizzes: updatedQuizzes }, {
      onSuccess: () => {
        setQuizItemOpen(false);
        toast.success(editingIndex !== null ? "Quiz item updated" : "Quiz item added");
      }
    });
  };

  const removeQuizItem = (session: any, index: number) => {
    const updated = [...session.quizzes];
    updated.splice(index, 1);
    updateSession.mutate({ id: session._id, quizzes: updated }, {
      onSuccess: () => toast.success("Quiz item removed")
    });
  };

  const cycleQuizItemStatus = (session: any, index: number) => {
    const updated = [...session.quizzes];
    const curr = updated[index].status;
    updated[index] = { ...updated[index], status: curr === 'PENDING' ? 'DONE' : curr === 'DONE' ? 'MISSED' : 'PENDING' };
    updateSession.mutate({ id: session._id, quizzes: updated });
  };

  const selectedSubjectData = useMemo(() => subjects?.find((s: any) => s._id === quizForm.subjectId), [subjects, quizForm.subjectId]);
  const selectedChapterData = useMemo(() => selectedSubjectData?.chapters?.find((c: any) => c._id === quizForm.chapterId), [selectedSubjectData, quizForm.chapterId]);



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 px-4 md:px-0">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-0">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground">Weekly Assessments</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Capture your performance across weekend drills</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto rounded-xl h-12 font-black shadow-lg shadow-primary/20 px-8 bg-primary">
          <Plus className="h-5 w-5 mr-2" /> Add Session
        </Button>
      </div>

      {/* ── Sessions ────────────────────────────────────────────────────── */}

      <div className="space-y-8 md:space-y-12">
        {sessions?.length === 0 ? (
          <div className="text-center py-20 md:py-24 bg-card/20 rounded-[2rem] md:rounded-[3rem] border border-dashed border-primary/10 flex flex-col items-center justify-center">
             <Target className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/20 mb-4" />
             <h3 className="font-heading text-xl font-bold text-foreground mb-1">No Assessment Vaults</h3>
             <p className="text-xs md:text-sm text-muted-foreground max-w-sm px-6 text-center">Weekend sessions appear here once completed or created manually.</p>
          </div>
        ) : (
          sessions.map((session: any) => (
            <div key={session._id} className="bg-card/40 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] border border-primary/5 p-5 md:p-10 hover:border-primary/20 transition-all duration-500 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] -translate-y-8 translate-x-8 transition-transform group-hover:scale-110 group-hover:rotate-12">
                <CalendarDays className="h-64 w-64" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10 relative z-10 text-center md:text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      ['Saturday', 'Sunday'].includes(session.dayName) ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                    }`}>
                      {session.dayName} Evaluation
                    </span>
                    <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                      session.status === 'COMPLETED' ? 'bg-success' :
                      session.status === 'ONGOING' ? 'bg-warning' : 'bg-muted'
                    }`} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                    {new Date(session.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                </div>

                <div className="flex flex-wrap justify-center md:justify-end gap-2 items-center">
                  <button
                    onClick={(e) => cycleSessionStatus(e, session)}
                    className={`px-5 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${
                      session.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
                      session.status === 'ONGOING' ? 'bg-warning/10 text-warning border-warning/20 animate-pulse' :
                      'bg-background border-primary/10 text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    {session.status}
                  </button>
                  <button
                    onClick={() => handleDeleteSessionClick(session)}
                    className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors border border-transparent"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>

              {/* Quiz grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 relative z-10">
                {session.quizzes.map((quiz: any, idx: number) => (
                  <div key={idx} className="bg-background/60 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-primary/5 hover:border-primary/20 transition-all group/quiz">
                     <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                           <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${
                             quiz.status === 'DONE' ? 'bg-success/10 text-success' : 
                             quiz.status === 'MISSED' ? 'bg-destructive/10 text-destructive' : 
                             'bg-primary/10 text-primary'
                           }`}>
                             <BookOpen className="h-5 w-5" />
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-foreground leading-tight truncate">{quiz.title}</p>
                              <div className="flex flex-col gap-1 mt-1.5">
                                 {quiz.subject && (
                                   <div className="flex items-center gap-1.5 opacity-60 text-[9px] font-black uppercase tracking-wider text-primary truncate">
                                      <Tag className="w-2.5 h-2.5" /> {quiz.subject.name}
                                   </div>
                                 )}
                                 {quiz.chapter && (
                                   <div className="text-[10px] font-bold text-foreground/70 pl-4 border-l-2 border-primary/20 ml-1 truncate">
                                      {quiz.chapter.name}
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="text-right shrink-0">
                           <p className="font-mono font-black text-primary text-xl leading-none">
                              {quiz.score}<span className="text-sm opacity-40 font-normal">/{quiz.totalMarks}</span>
                           </p>
                           <div className="h-1 bg-secondary/50 rounded-full w-16 mt-2 ml-auto overflow-hidden">
                              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${quiz.totalMarks > 0 ? (quiz.score / quiz.totalMarks) * 100 : 0}%` }} />
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between mt-4 md:mt-5 pt-3 md:pt-4 border-t border-primary/5">
                        <button
                          onClick={() => cycleQuizItemStatus(session, idx)}
                          className={`px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border ${
                            quiz.status === 'DONE' ? 'bg-success/10 text-success border-success/20' : 
                            quiz.status === 'MISSED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                            'bg-primary/5 text-primary/60 border-primary/10'
                          }`}
                        >
                           {quiz.status}
                        </button>
                        <div className="flex items-center gap-1 md:gap-2 sm:opacity-0 group-hover/quiz:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditQuizItem(session, idx)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                               <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeQuizItem(session, idx)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                               <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                     </div>
                  </div>
                ))}

                <button
                  onClick={() => openAddQuizItem(session)}
                  className="bg-primary/5 hover:bg-primary/10 border border-dashed border-primary/20 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 text-center transition-all group/add flex items-center justify-center gap-3 min-h-[100px] md:min-h-[120px]"
                >
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover/add:scale-110">
                    <Plus className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-primary/60 uppercase tracking-widest">Archive Unit Assessment</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Dialogs ────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md shadow-2xl border-primary/10">
          <DialogHeader><DialogTitle className="font-heading text-2xl font-black">Open Evaluation Vault</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
             <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vault Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left font-bold rounded-xl border-primary/10">
                      <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                      {newSessionForm.date ? format(parseISO(newSessionForm.date), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar mode="single" selected={newSessionForm.date ? parseISO(newSessionForm.date) : undefined} onSelect={(date) => date && setNewSessionForm({ ...newSessionForm, date: format(date, "yyyy-MM-dd") })} initialFocus className="p-3" />
                  </PopoverContent>
                </Popover>
             </div>
             <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vault Status</Label>
               <Select value={newSessionForm.status} onValueChange={(val) => setNewSessionForm({ ...newSessionForm, status: val })}>
                 <SelectTrigger className="h-12 rounded-xl border-primary/10"><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="PENDING">PENDING</SelectItem>
                   <SelectItem value="ONGOING">ONGOING</SelectItem>
                   <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <Button onClick={handleCreateSession} className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20">Create Assessment Vault</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={quizItemOpen} onOpenChange={setQuizItemOpen}>
        <DialogContent className="rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-[95vw] sm:max-w-md shadow-2xl border-primary/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-heading text-2xl font-black">{editingIndex !== null ? 'Modify Assessment' : 'Evaluation Entry'}</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Test Identifier *</Label>
              <Input className="h-12 rounded-xl border-primary/10" placeholder="e.g. Logic Minimization Quiz 1" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Score</Label>
                <Input type="number" className="h-12 rounded-xl border-primary/10" value={quizForm.score} onChange={(e) => setQuizForm({ ...quizForm, score: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Max Marks</Label>
                <Input type="number" className="h-12 rounded-xl border-primary/10" value={quizForm.totalMarks} onChange={(e) => setQuizForm({ ...quizForm, totalMarks: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Outcome Status</Label>
              <Select value={quizForm.status} onValueChange={(val) => setQuizForm({ ...quizForm, status: val })}>
                <SelectTrigger className="h-12 rounded-xl border-primary/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="DONE">SUCCESSFUL / DONE</SelectItem>
                  <SelectItem value="MISSED">MISSED / FAILED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cascading Tag Selects */}
            <div className="space-y-3 p-4 bg-primary/5 rounded-[1.5rem] border border-primary/10">
               <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Link Knowledge Domain</Label>
               <Select value={quizForm.subjectId} onValueChange={(val) => setQuizForm({ ...quizForm, subjectId: val, chapterId: 'all', topicId: 'all' })}>
                 <SelectTrigger className="h-11 rounded-full px-4 border-primary/20 bg-background/50 backdrop-blur-sm">
                   <SelectValue placeholder="Select Subject" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all" className="text-muted-foreground italic">Assorted Topics</SelectItem>
                   {subjects?.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                 </SelectContent>
               </Select>

               {quizForm.subjectId !== 'all' && (
                  <Select value={quizForm.chapterId} onValueChange={(val) => setQuizForm({ ...quizForm, chapterId: val, topicId: 'all' })}>
                    <SelectTrigger className="h-11 rounded-full px-4 border-primary/20 bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select Chapter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-muted-foreground italic">Full Subject Scope</SelectItem>
                      {selectedSubjectData?.chapters?.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               )}

               {quizForm.chapterId !== 'all' && quizForm.subjectId !== 'all' && (
                  <Select value={quizForm.topicId} onValueChange={(val) => setQuizForm({ ...quizForm, topicId: val })}>
                    <SelectTrigger className="h-11 rounded-full px-4 border-primary/20 bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-muted-foreground italic">Full Chapter Scope</SelectItem>
                      {selectedChapterData?.topics?.map((t: any) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Self-Reflection / Errors</Label>
              <Textarea className="rounded-2xl min-h-[80px]" value={quizForm.notes} onChange={(e) => setQuizForm({ ...quizForm, notes: e.target.value })} />
            </div>

            <Button onClick={handleSaveQuizItem} className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20">
               {editingIndex !== null ? 'Commit Changes' : 'Archive Assessment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteSessionOpen} onOpenChange={setDeleteSessionOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-primary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl font-black">Wipe Assessment Vault?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed">
               This will permanently delete the evaluation vault for 
               <strong className="text-foreground ml-1">{sessionToDelete?.date && format(new Date(sessionToDelete.date), "PPP")}</strong>. 
               This cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="h-12 rounded-xl font-bold border-primary/10">Preserve Vault</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSession} className="h-12 rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Wipe</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
