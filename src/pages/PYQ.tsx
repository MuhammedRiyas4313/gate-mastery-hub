import { usePYQs } from "@/hooks/usePYQs";
import { useSubjects } from "@/hooks/useSubjects";
import { useState, useMemo } from "react";
import { Plus, Filter, Loader2, Save, Trash2, Tag, CalendarDays, Award, BookOpen, Layers, RefreshCw } from "lucide-react";
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

export default function PYQ() {
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const { data: pyqs, isLoading, isFetching, addPYQ, updatePYQ, deletePYQ } = usePYQs({
    status: filterStatus,
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
  const [pyqToDelete, setPyqToDelete] = useState<any>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedPYQ, setSelectedPYQ] = useState<any>(null);

  const [form, setForm] = useState({
    title: '',
    year: '',
    source: 'GATE',
    difficulty: 'MEDIUM',
    date: new Date().toISOString().split('T')[0],
    tagSubjectId: 'all',
    tagChapterId: 'all',
    tagTopicId: 'all',
    notes: '',
    status: 'PENDING'
  });

  const handleCreateNew = () => {
    setSelectedPYQ(null);
    setForm({
      title: '',
      year: new Date().getFullYear().toString(),
      source: 'GATE',
      difficulty: 'MEDIUM',
      date: new Date().toISOString().split('T')[0],
      tagSubjectId: 'all',
      tagChapterId: 'all',
      tagTopicId: 'all',
      notes: '',
      status: 'PENDING'
    });
    setEditOpen(true);
  };

  const handleEditClick = (pyq: any) => {
    setSelectedPYQ(pyq);
    setForm({
      title: pyq.title || '',
      year: pyq.year || '',
      source: pyq.source || 'GATE',
      difficulty: pyq.difficulty || 'MEDIUM',
      date: pyq.date ? new Date(pyq.date).toISOString().split('T')[0] : new Date(pyq.createdAt || Date.now()).toISOString().split('T')[0],
      tagSubjectId: pyq.subject?._id || pyq.subject || 'all',
      tagChapterId: pyq.chapter?._id || pyq.chapter || 'all',
      tagTopicId: pyq.topic?._id || pyq.topic || 'all',
      notes: pyq.notes || '',
      status: pyq.status || 'PENDING'
    });
    setEditOpen(true);
  };

  const handleToggleStatus = (e: any, pyq: any) => {
    e.stopPropagation();
    const nextStatus = pyq.status === 'PENDING' ? 'ONGOING' : pyq.status === 'ONGOING' ? 'COMPLETED' : 'PENDING';
    updatePYQ.mutate({ id: pyq._id, status: nextStatus }, {
      onSuccess: () => toast.success(`PYQ marked as ${nextStatus}`)
    });
  };

  const handleDeleteClick = (e: any, pyq: any) => {
    e.stopPropagation();
    setPyqToDelete(pyq);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pyqToDelete) return;
    deletePYQ.mutate(pyqToDelete._id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setPyqToDelete(null);
        toast.success("PYQ deleted successfully");
      }
    });
  };

  const selectedSubjectData = useMemo(() => subjects?.find((s: any) => s._id === form.tagSubjectId), [subjects, form.tagSubjectId]);
  const selectedChapterData = useMemo(() => selectedSubjectData?.chapters?.find((c: any) => c._id === form.tagChapterId), [selectedSubjectData, form.tagChapterId]);

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (selectedPYQ) {
      updatePYQ.mutate({
        ...selectedPYQ,
        id: selectedPYQ._id,
        title: form.title,
        year: form.year,
        source: form.source,
        difficulty: form.difficulty,
        subjectId: form.tagSubjectId !== 'all' ? form.tagSubjectId : null,
        chapterId: form.tagChapterId !== 'all' ? form.tagChapterId : null,
        topicId: form.tagTopicId !== 'all' ? form.tagTopicId : null,
        status: form.status,
        notes: form.notes,
        date: form.date
      }, {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("PYQ updated successfully");
        }
      });
    } else {
      addPYQ.mutate({
        title: form.title,
        year: form.year,
        source: form.source,
        difficulty: form.difficulty,
        subjectId: form.tagSubjectId !== 'all' ? form.tagSubjectId : null,
        chapterId: form.tagChapterId !== 'all' ? form.tagChapterId : null,
        topicId: form.tagTopicId !== 'all' ? form.tagTopicId : null,
        status: form.status,
        date: form.date,
        notes: form.notes
      }, {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("PYQ created manually");
        }
      });
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground">Previous Year Questions</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Master the archive by solving topic-wise past papers</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Filters */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="flex-1 sm:w-36 h-12 rounded-xl bg-card border-primary/10 text-xs font-bold">
              <Filter className="w-3.5 h-3.5 mr-2 opacity-50" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
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
              <SelectItem value="date">Exam/Added Date</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleCreateNew} className="w-full sm:w-auto rounded-xl h-12 font-black shadow-lg shadow-primary/20 px-6 bg-primary">
            <Plus className="h-5 w-5 mr-2" /> Add PYQ
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : (pyqs ?? []).map((pyq: any) => (
          <div key={pyq._id} className="bg-card/40 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-primary/5 hover:border-primary/20 transition-all duration-500 shadow-sm relative overflow-hidden group">
            <div className="space-y-6 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleStatus(e, pyq)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 border ${pyq.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
                        pyq.status === 'ONGOING' ? 'bg-warning/10 text-warning animate-pulse border-warning/20' :
                          'bg-primary/5 text-primary/60 border-primary/10'
                      }`}>
                    {pyq.status}
                  </button>
                  <button onClick={(e) => handleDeleteClick(e, pyq)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${pyq.difficulty === 'HARD' ? 'bg-destructive/10 text-destructive' :
                    pyq.difficulty === 'MEDIUM' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                  }`}>
                  {pyq.difficulty}
                </div>
              </div>

              <div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground leading-tight">{pyq.title}</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[10px] md:text-xs font-semibold text-muted-foreground opacity-80">
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {pyq.source} {pyq.year || ''}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {pyq.date ? new Date(pyq.date).toLocaleDateString() : 'Auto-generated'}</span>
                </div>
              </div>

              {(pyq.subject || pyq.chapter) && (
                <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 flex flex-col gap-1">
                  {pyq.subject && (
                    <p className="text-[10px] font-black uppercase text-primary/70 flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> {pyq.subject.name || 'Subject'}</p>
                  )}
                  {pyq.chapter && (
                    <p className="text-xs font-semibold text-foreground pl-4 border-l-2 border-primary/20 ml-1.5">{pyq.chapter.name || 'Chapter'}</p>
                  )}
                </div>
              )}

              <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-primary/10 hover:border-primary/30 mt-4" onClick={() => handleEditClick(pyq)}>
                Configure PYQ
              </Button>
            </div>
          </div>
        ))}

        {!isLoading && (!pyqs || pyqs.length === 0) && (
          <div className="col-span-full py-20 text-center bg-card/20 rounded-[2.5rem] border border-dashed border-primary/10 flex flex-col items-center justify-center">
            <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">No PYQs Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Adjust your filters or complete a chapter to auto-generate past year questions.</p>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-black">{selectedPYQ ? `Configure PYQ` : `Add PYQ`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Question Details</Label>
              <Input className="h-12 rounded-xl" placeholder="Title/Description (e.g., Gate 2021 Question 45)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input className="h-12 rounded-xl" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                <Input className="h-12 rounded-xl" placeholder="Source (e.g., GATE)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
            </div>

            {!selectedPYQ && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Scheduled / Assigned Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={`w-full h-12 justify-start text-left font-bold rounded-xl ${!form.date && "text-muted-foreground"}`}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {form.date ? format(parseISO(form.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={form.date ? parseISO(form.date) : undefined}
                      onSelect={(date) => date && setForm({ ...form, date: format(date, "yyyy-MM-dd") })}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(val) => setForm({ ...form, difficulty: val })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="space-y-3 p-4 bg-primary/5 rounded-[1.5rem] border border-primary/10">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tag to Content</Label>
              <Select value={form.tagSubjectId} onValueChange={(val) => setForm({ ...form, tagSubjectId: val, tagChapterId: 'all', tagTopicId: 'all' })}>
                <SelectTrigger className="h-11 rounded-full px-4 border-primary/20 bg-background/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-muted-foreground italic">None</SelectItem>
                  {subjects?.map((s: any) => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>

              {form.tagSubjectId !== 'all' && (
                <Select value={form.tagChapterId} onValueChange={(val) => setForm({ ...form, tagChapterId: val, tagTopicId: 'all' })}>
                  <SelectTrigger className="h-11 rounded-full px-4 border-primary/20 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select Chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-muted-foreground italic">All Chapters</SelectItem>
                    {selectedSubjectData?.chapters?.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {form.tagChapterId !== 'all' && form.tagSubjectId !== 'all' && (
                <Select value={form.tagTopicId} onValueChange={(val) => setForm({ ...form, tagTopicId: val })}>
                  <SelectTrigger className="h-11 rounded-full px-4 border-primary/20 bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-muted-foreground italic">All Topics</SelectItem>
                    {selectedChapterData?.topics?.map((t: any) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">Notes / Formulae Used</Label>
              <Textarea className="rounded-2xl min-h-[100px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <Button onClick={handleSave} className="w-full h-12 rounded-xl font-black shadow-lg shadow-primary/20" disabled={updatePYQ.isPending || addPYQ.isPending}>
              {(updatePYQ.isPending || addPYQ.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-[2rem] border-primary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl font-black">Delete PYQ?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              This will permanently delete the practice question
              <strong className="text-foreground ml-1">
                {pyqToDelete?.title}
              </strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="h-12 rounded-xl font-bold border-primary/10 hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="h-12 rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20">
              {deletePYQ.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
