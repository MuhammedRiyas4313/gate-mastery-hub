import { useTestSeries } from "@/hooks/useTestSeries";
import { useSubjects } from "@/hooks/useSubjects";
import { useState, useMemo } from "react";
import { Plus, Loader2, Save, Trash2, Calendar as CalendarIcon, BookOpen, Layers, CalendarDays, Trophy, Target, TrendingUp, Settings2, Award, Tag, RefreshCw } from "lucide-react";
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

export default function TestSeries() {
  // ── Server-side filters ────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const { data: tests, isLoading, isFetching, addTestSeries, updateTestSeries, deleteTestSeries } = useTestSeries({
    status: filterStatus,
    type: filterType,
    subjectId: filterSubject,
    chapterId: filterChapter,
    sortBy: sortBy,
  });
  const { data: subjects } = useSubjects();

  const filterSubjectData = useMemo(
    () => subjects?.find((s: any) => s._id === filterSubject),
    [subjects, filterSubject]
  );

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<any>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'CHAPTER' as 'CHAPTER' | 'SUBJECT' | 'FULL_LENGTH',
    tagSubjectId: 'all',
    tagChapterId: 'all',
    score: '',
    totalMarks: '100',
    notes: '',
    status: 'PENDING'
  });

  const handleCreateNew = () => {
    setSelectedTest(null);
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'CHAPTER',
      tagSubjectId: 'all',
      tagChapterId: 'all',
      score: '0',
      totalMarks: '100',
      notes: '',
      status: 'PENDING'
    });
    setEditOpen(true);
  };

  const handleEditClick = (test: any) => {
    setSelectedTest(test);
    setForm({
      title: test.title || '',
      date: test.date ? new Date(test.date).toISOString().split('T')[0] : new Date(test.createdAt || Date.now()).toISOString().split('T')[0],
      type: (test.type || 'CHAPTER') as 'CHAPTER' | 'SUBJECT' | 'FULL_LENGTH',
      tagSubjectId: test.subject?._id || test.subject || 'all',
      tagChapterId: test.chapter?._id || test.chapter || 'all',
      score: test.score?.toString() || '0',
      totalMarks: test.totalMarks?.toString() || '100',
      notes: test.notes || '',
      status: test.status || 'PENDING'
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (e: any, test: any) => {
    if (e) e.stopPropagation();
    setTestToDelete(test);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!testToDelete) return;
    deleteTestSeries.mutate(testToDelete._id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setTestToDelete(null);
        setEditOpen(false);
        toast.success("Test record purged");
      }
    });
  };

  const handleToggleStatus = (e: any, test: any) => {
    e.stopPropagation();
    const cycle = ['PENDING', 'ONGOING', 'COMPLETED', 'MISSED'];
    const currIdx = cycle.indexOf(test.status);
    const nextStatus = cycle[(currIdx + 1) % cycle.length];
    
    updateTestSeries.mutate({ id: test._id, status: nextStatus }, {
      onSuccess: () => toast.success(`Test marked as ${nextStatus}`)
    });
  };

  const selectedSubjectData = useMemo(() => subjects?.find((s: any) => s._id === form.tagSubjectId), [subjects, form.tagSubjectId]);

  const handleSave = () => {
    if (form.type !== 'FULL_LENGTH') {
       if (form.tagSubjectId === 'all') {
          toast.error('Please select a Subject');
          return;
       }
       if (form.type === 'CHAPTER' && form.tagChapterId === 'all') {
          toast.error('Please select a Chapter');
          return;
       }
    }

    let finalTitle = form.title.trim();
    if (!finalTitle) {
       const subjectName = selectedSubjectData?.name || '';
       const chapterName = selectedSubjectData?.chapters?.find((c: any) => c._id === form.tagChapterId)?.name || '';
       if (form.type === 'SUBJECT') finalTitle = `Subject Mastery: ${subjectName}`;
       else if (form.type === 'CHAPTER') finalTitle = `Chapter evaluation: ${chapterName}`;
       else finalTitle = `Full Length Mock - ${form.date}`;
    }

    const payload = {
      title: finalTitle,
      type: form.type,
      subjectId: form.tagSubjectId !== 'all' ? form.tagSubjectId : null,
      chapterId: form.tagChapterId !== 'all' ? form.tagChapterId : null,
      score: Number(form.score) || 0,
      totalMarks: Number(form.totalMarks) || 100,
      status: form.status,
      date: form.date,
      notes: form.notes
    };

    if (selectedTest) {
      updateTestSeries.mutate({ ...payload, id: selectedTest._id }, {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Test configuration updated");
        }
      });
    } else {
      addTestSeries.mutate(payload, {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("New test series added to vault");
        }
      });
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">

      {/* ── Compact Filter Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground">Test Series</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Coordinate your performance evaluations and mock outcomes</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="flex-1 sm:w-36 h-12 rounded-xl bg-card border-primary/10 text-xs font-bold">
              <Target className="w-3.5 h-3.5 mr-2 opacity-50" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="MISSED">Missed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={(v) => { setFilterType(v); setFilterSubject('all'); setFilterChapter('all'); }}>
            <SelectTrigger className="flex-1 sm:w-36 h-12 rounded-xl bg-card border-primary/10 text-xs font-bold">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CHAPTER">Chapter</SelectItem>
              <SelectItem value="SUBJECT">Subject</SelectItem>
              <SelectItem value="FULL_LENGTH">Full Length</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSubject} onValueChange={(v) => { setFilterSubject(v); setFilterChapter('all'); }}>
            <SelectTrigger className="flex-1 sm:w-40 h-12 rounded-xl bg-card border-primary/10 text-xs font-bold">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects?.map((s: any) => (
                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filterSubject !== 'all' && filterSubjectData?.chapters?.length > 0 && (
            <Select value={filterChapter} onValueChange={setFilterChapter}>
              <SelectTrigger className="flex-1 sm:w-40 h-12 rounded-xl bg-card border-primary/10 text-xs font-bold">
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {filterSubjectData.chapters.map((c: any) => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort Menu */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 sm:w-40 h-12 rounded-xl bg-card border-primary/10 text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5 mr-2 opacity-50" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Recently Added</SelectItem>
              <SelectItem value="date">Test/Added Date</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleCreateNew} className="w-full sm:w-auto rounded-xl h-12 font-black shadow-lg shadow-primary/20 px-6 bg-primary shrink-0">
            <Plus className="h-5 w-5 mr-2" /> New Test
          </Button>
        </div>
      </div>

      {/* ── Cards Grid ────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : (tests ?? []).map((test: any) => (
          <TestCard key={test._id} test={test} onEdit={handleEditClick} onToggleStatus={handleToggleStatus} />
        ))}

        {!isLoading && (!tests || tests.length === 0) && (
          <div className="col-span-full py-20 text-center bg-card/20 rounded-[2.5rem] border border-dashed border-primary/10 flex flex-col items-center justify-center">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">No Tests Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {filterStatus !== 'all' || filterSubject !== 'all' || filterType !== 'all'
                ? 'No tests match your current filters. Try adjusting them.'
                : 'Add your first test to start tracking your assessment performance.'}
            </p>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 border-none shadow-2xl">
           <DialogHeader className="mb-8">
             <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                   <Settings2 className="h-6 w-6" />
                </div>
                <DialogTitle className="font-heading text-3xl font-black tracking-tight">
                  {selectedTest ? 'Update Logic' : 'New Assessment'}
                </DialogTitle>
             </div>
             <p className="text-sm text-muted-foreground font-medium">Fine-tune the parameters of your test series vault.</p>
           </DialogHeader>
           
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Test Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-14 justify-start text-left font-black rounded-2xl border-primary/10 bg-primary/5 px-5 group hover:border-primary/30 transition-all">
                          <CalendarDays className="mr-3 h-5 w-5 text-primary opacity-40 group-hover:opacity-100" />
                          {form.date ? format(parseISO(form.date), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-[2rem] border-primary/10 shadow-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={form.date ? parseISO(form.date) : undefined}
                          onSelect={(date) => date && setForm({ ...form, date: format(date, "yyyy-MM-dd") })}
                          initialFocus
                          className="p-4"
                        />
                      </PopoverContent>
                    </Popover>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Test Category</Label>
                    <Select value={form.type} onValueChange={(val: any) => setForm({ ...form, type: val })} disabled={!!selectedTest}>
                      <SelectTrigger className="h-14 rounded-2xl bg-primary/5 border-primary/10 px-5 font-black text-foreground">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="CHAPTER">Chapter-wise</SelectItem>
                        <SelectItem value="SUBJECT">Full Subject</SelectItem>
                        <SelectItem value="FULL_LENGTH">Full Length Mock</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Title & Identity</Label>
                 <Input 
                   placeholder={form.type === 'FULL_LENGTH' ? "Ex: GATE 2024 Mock #1" : "Auto-generated from tags if empty"} 
                   className="h-14 rounded-2xl bg-background border-primary/10 px-6 font-bold shadow-sm"
                   value={form.title} 
                   onChange={(e) => setForm({ ...form, title: e.target.value })} 
                 />
              </div>

              {form.type !== 'FULL_LENGTH' && (
                 <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-5 shadow-inner">
                    <Label className="text-[10px] font-black uppercase text-secondary-foreground opacity-60 flex items-center gap-2">
                       <Tag className="w-3 h-3" /> Association Mapping
                    </Label>
                    <div className="space-y-3">
                       <Select value={form.tagSubjectId} onValueChange={(val) => setForm({ ...form, tagSubjectId: val, tagChapterId: 'all' })}>
                         <SelectTrigger className="h-12 rounded-xl bg-background border-primary/5 px-4 font-bold">
                           <SelectValue placeholder="Target Subject" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="all" className="italic opacity-50">Unsorted Domain</SelectItem>
                           {subjects?.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                         </SelectContent>
                       </Select>
                       
                       {form.type === 'CHAPTER' && form.tagSubjectId !== 'all' && (
                          <Select value={form.tagChapterId} onValueChange={(val) => setForm({ ...form, tagChapterId: val })}>
                            <SelectTrigger className="h-12 rounded-xl bg-background border-primary/5 px-4 font-bold">
                              <SelectValue placeholder="Target Chapter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all" className="italic opacity-50">General Chapter</SelectItem>
                              {selectedSubjectData?.chapters?.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                       )}
                    </div>
                 </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Score</Label>
                    <Input type="number" className="h-14 rounded-2xl bg-primary/5 border-primary/10 font-mono text-xl font-black text-center" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total</Label>
                    <Input type="number" className="h-14 rounded-2xl bg-primary/5 border-primary/10 font-mono text-xl font-black text-center" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</Label>
                    <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                       <SelectTrigger className="h-14 rounded-2xl bg-primary/5 border-primary/10 font-black">
                          <SelectValue placeholder="Select" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="ONGOING">ONGOING</SelectItem>
                          <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                          <SelectItem value="MISSED">MISSED</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Notes & Strategies</Label>
                 <Textarea 
                   placeholder="Document your errors, formulas to revise, or time management strategy."
                   className="rounded-[2rem] bg-background border-primary/10 min-h-[120px] p-6 text-sm font-medium" 
                   value={form.notes} 
                   onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                 />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 {selectedTest && (
                   <Button variant="ghost" onClick={() => handleDeleteClick(null, selectedTest)} className="h-14 sm:w-14 rounded-2xl font-black text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-6 w-6" />
                   </Button>
                 )}
                 <Button variant="ghost" onClick={() => setEditOpen(false)} className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] opacity-50">Discard</Button>
                 <Button onClick={handleSave} className="h-15 flex-[3] rounded-2xl font-black text-lg bg-primary shadow-2xl shadow-primary/30 transform active:scale-95 transition-all">
                    {updateTestSeries.isPending || addTestSeries.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 mr-3" />}
                    {selectedTest ? 'Update Record' : 'Log Assessment'}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-[3rem] border-primary/10 p-10">
          <AlertDialogHeader>
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mb-6">
               <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-heading text-3xl font-black">Purge Test Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground py-4">
              You are about to permanently delete <strong className="text-foreground">{testToDelete?.title}</strong>. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-primary/10">Wait, Abort</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20">
               Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="col-span-full py-16 md:py-20 bg-card/10 rounded-[2rem] md:rounded-[3rem] border border-dashed border-primary/5 flex flex-col items-center justify-center text-center px-6 md:px-10">
       <div className="mb-4 md:mb-6 opacity-20 transform hover:scale-110 transition-transform scale-90 md:scale-100">{icon}</div>
       <p className="text-xs md:text-sm font-bold text-muted-foreground/60 uppercase tracking-[0.2em] max-w-xs leading-relaxed">{text}</p>
    </div>
  );
}

function TestCard({ test, onEdit, onToggleStatus }: { test: any, onEdit: (t: any) => void, onToggleStatus: (e: any, t: any) => void }) {
  const isSubject = test.type === 'SUBJECT';
  const isFull = test.type === 'FULL_LENGTH';
  const pct = test.totalMarks > 0 ? (test.score / test.totalMarks) * 100 : 0;

  return (
    <div className="bg-card/40 backdrop-blur-xl rounded-[1.5rem] p-4 md:p-5 border border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm group">
      <div className="space-y-3">
        {/* Top row: status + type badge */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={(e) => onToggleStatus(e, test)}
            className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border shrink-0 ${
              test.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
              test.status === 'ONGOING'   ? 'bg-warning/10 text-warning border-warning/20 animate-pulse' :
              test.status === 'MISSED'    ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                            'bg-primary/5 text-primary/60 border-primary/10'
            }`}
          >
            {test.status}
          </button>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
            isSubject ? 'bg-accent/10 text-accent' : isFull ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          }`}>
            {test.type?.replace('_', ' ')}
          </span>
        </div>

        {/* Title + meta */}
        <div>
          <h4
            className="font-heading text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
            onClick={() => onEdit(test)}
          >
            {test.title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">
            <span className="flex items-center gap-1"><CalendarIcon className="h-2.5 w-2.5" />{format(new Date(test.date || test.createdAt), 'dd MMM yyyy')}</span>
            {test.subject?.name && <span>• {test.subject.name}</span>}
          </div>
        </div>

        {/* Score + progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Score</span>
            <div>
              <span className="font-mono text-base font-black text-primary">{test.score || 0}</span>
              <span className="font-mono text-[10px] opacity-30 font-bold ml-0.5">/{test.totalMarks || 100}</span>
            </div>
          </div>
          <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-[1.5s] ease-out ${pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-destructive'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Configure button — shown on hover */}
        <Button
          variant="outline"
          className="w-full h-8 rounded-xl font-bold text-[10px] uppercase tracking-widest border-primary/10 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
          onClick={() => onEdit(test)}
        >
          Configure
        </Button>
      </div>
    </div>
  );
}
