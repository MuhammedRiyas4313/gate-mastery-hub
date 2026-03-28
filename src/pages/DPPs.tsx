import { useDPPs } from "@/hooks/useDPPs";
import { useSubjects } from "@/hooks/useSubjects";
import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Loader2, Save, Plus, Trash2, Tag, CalendarDays, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function DPPs() {
  // ── Server-side filters ────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');

  const { data: dpps, isLoading, updateDPP, deleteDPP } = useDPPs({
    status: filterStatus,
    subjectId: filterSubject,
    chapterId: filterChapter,
  });
  const { data: subjects } = useSubjects();

  // Chapter list for the active filter subject
  const filterSubjectData = useMemo(
    () => subjects?.find((s: any) => s._id === filterSubject),
    [subjects, filterSubject]
  );

  // ── Dialog / form state ────────────────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dppToDelete, setDppToDelete] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDPP, setSelectedDPP] = useState<any>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    notes: '',
    tagSubjectId: 'all',
    tagChapterId: 'all',
    tagTopicId: 'all',
    tags: [] as any[]
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setSelectedDPP(null);
    setForm({
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      notes: '',
      tagSubjectId: 'all',
      tagChapterId: 'all',
      tagTopicId: 'all',
      tags: []
    });
    setEditOpen(true);
  };

  const handleToggleStatus = (e: any, dpp: any) => {
    e.stopPropagation();
    const nextStatus = dpp.status === 'PENDING' ? 'ONGOING' : dpp.status === 'ONGOING' ? 'COMPLETED' : 'PENDING';
    updateDPP.mutate({ id: dpp._id, status: nextStatus, notes: dpp.notes, tags: dpp.tags }, {
      onSuccess: () => toast.success(`DPP marked as ${nextStatus}`)
    });
  };

  const handleEditClick = (dpp: any) => {
    setSelectedDPP(dpp);
    setForm({
      date: new Date(dpp.date).toISOString().split('T')[0],
      status: dpp.status || 'PENDING',
      notes: dpp.notes || '',
      tagSubjectId: 'all',
      tagChapterId: 'all',
      tagTopicId: 'all',
      tags: dpp.tags || []
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (e: any, dpp: any) => {
    e.stopPropagation();
    setDppToDelete(dpp);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!dppToDelete) return;
    deleteDPP.mutate(dppToDelete._id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setDppToDelete(null);
        toast.success("DPP deleted successfully");
      }
    });
  };

  const handleSave = () => {
    updateDPP.mutate({
      id: selectedDPP?._id,
      createNew: !selectedDPP,
      date: selectedDPP ? undefined : form.date,
      status: form.status,
      notes: form.notes,
      tags: form.tags
    }, {
      onSuccess: () => {
        setEditOpen(false);
        toast.success(selectedDPP ? "DPP updated" : "DPP created");
      }
    });
  };

  const addTag = () => {
    if (form.tagSubjectId === 'all' || !form.tagSubjectId) return;
    const newTag: any = { subject: form.tagSubjectId };
    if (form.tagChapterId && form.tagChapterId !== 'all') newTag.chapter = form.tagChapterId;
    if (form.tagTopicId && form.tagTopicId !== 'all') newTag.topic = form.tagTopicId;
    setForm({
      ...form,
      tags: [...form.tags, newTag],
      tagSubjectId: 'all',
      tagChapterId: 'all',
      tagTopicId: 'all'
    });
  };

  const removeTag = (index: number) => {
    const newTags = [...form.tags];
    newTags.splice(index, 1);
    setForm({ ...form, tags: newTags });
  };

  const selectedSubjectData = useMemo(() => subjects?.find((s: any) => s._id === form.tagSubjectId), [subjects, form.tagSubjectId]);
  const selectedChapterData = useMemo(() => selectedSubjectData?.chapters?.find((c: any) => c._id === form.tagChapterId), [selectedSubjectData, form.tagChapterId]);

  const statusStyle = (s: string) =>
    s === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
    s === 'ONGOING'   ? 'bg-warning/10 text-warning animate-pulse border-warning/20' :
                        'bg-background border-primary/10 text-muted-foreground hover:border-primary/30 hover:text-foreground';

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 px-4 md:px-0">

      {/* ── Compact Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground">Daily Practice Papers</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Coordinate your daily consistency and problem-solving metrics</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Status filter */}
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

          {/* Subject filter */}
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

          {/* Chapter filter — visible when a subject is selected */}
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

          <Button onClick={handleCreateNew} className="w-full sm:w-auto rounded-xl h-12 font-black shadow-lg shadow-primary/20 px-6 bg-primary shrink-0">
            <Plus className="h-5 w-5 mr-2" /> Add DPP
          </Button>
        </div>
      </div>

      {/* ── Cards Grid ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(dpps ?? []).map((dpp: any) => (
              <div key={dpp._id} className="group relative bg-card/50 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5">
                <div className="flex flex-col h-full space-y-5 md:space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
                      <CalendarIcon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleStatus(e, dpp)}
                        className={`shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border ${statusStyle(dpp.status)}`}
                      >
                        {dpp.status}
                      </button>
                      <button onClick={(e) => handleDeleteClick(e, dpp)} className="shrink-0 p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading text-base md:text-lg font-bold text-foreground leading-tight">
                      {new Date(dpp.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex flex-col gap-2 mt-4">
                      {dpp.tags?.length > 0 ? (
                        dpp.tags.map((tag: any, i: number) => (
                          <div key={i} className="flex flex-col gap-1 p-2 rounded-xl bg-primary/5 border border-primary/5 text-primary text-[10px] font-bold">
                            <div className="flex items-center gap-1.5 opacity-80 uppercase tracking-wider">
                              <Tag className="h-3 w-3" /> {tag.subject?.name}
                            </div>
                            {tag.chapter?.name && <div className="text-foreground/80 pl-4 border-l-2 border-primary/20 ml-1.5 truncate text-xs font-semibold">{tag.chapter?.name}</div>}
                            {tag.topic?.name && <div className="text-muted-foreground pl-4 border-l-2 border-primary/20 ml-1.5 truncate">{tag.topic?.name}</div>}
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground opacity-40">No subjects tagged yet</span>
                      )}
                    </div>
                  </div>

                  {dpp.notes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-3">{dpp.notes}</p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-bold border-primary/10 hover:border-primary/40 mt-auto"
                    onClick={() => handleEditClick(dpp)}
                  >
                    Configure DPP
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {(!dpps || dpps.length === 0) && (
            <div className="py-20 text-center bg-card/20 rounded-[2.5rem] border border-dashed border-primary/10 flex flex-col items-center justify-center">
              <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">No DPPs Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filterStatus !== 'all' || filterSubject !== 'all'
                  ? 'No DPPs match your current filters. Try adjusting them.'
                  : 'Add your first DPP to start tracking daily practice.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Edit / Create Dialog ──────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-primary/10 shadow-2xl max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl font-black">
              {selectedDPP ? `Update DPP — ${new Date(selectedDPP.date).toLocaleDateString()}` : 'Create DPP'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">

            {!selectedDPP && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">DPP Date</Label>
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

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</Label>
              <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ONGOING">ONGOING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags section */}
            <div className="space-y-3 p-4 bg-primary/5 rounded-[1.5rem] border border-primary/10">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Link Content to DPP</Label>
              <div className="space-y-3">
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
                      <SelectValue placeholder="Select Chapter (Optional)" />
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
                      <SelectValue placeholder="Select Topic (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-muted-foreground italic">All Topics</SelectItem>
                      {selectedChapterData?.topics?.map((t: any) => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}

                <Button onClick={addTag} type="button" variant="default" className="w-full h-11 rounded-full" disabled={form.tagSubjectId === 'all'}>
                  <Plus className="h-4 w-4 mr-2" /> Add Tag
                </Button>
              </div>

              {form.tags.length > 0 && (
                <div className="mt-4 space-y-2 pt-2 border-t border-primary/10">
                  {form.tags.map((tag: any, i: number) => {
                    const s = subjects?.find((s: any) => s._id === (tag.subject?._id || tag.subject));
                    const c = s?.chapters?.find((c: any) => c._id === (tag.chapter?._id || tag.chapter));
                    const t = c?.topics?.find((t: any) => t._id === (tag.topic?._id || tag.topic));
                    return (
                      <div key={i} className="flex items-center justify-between gap-2 bg-background/50 border border-primary/10 px-4 py-3 rounded-2xl group">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase text-primary/70">{s?.name}</p>
                          {c && <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>}
                          {t && <p className="text-[10px] font-medium text-muted-foreground truncate">{t.name}</p>}
                        </div>
                        <button onClick={() => removeTag(i)} className="opacity-40 hover:opacity-100 hover:text-destructive transition-colors shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Observations / Notes</Label>
              <Input className="h-12 rounded-xl" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Focus areas, common mistakes..." />
            </div>

            <Button onClick={handleSave} className="w-full h-12 rounded-2xl font-black shadow-lg shadow-primary/20" disabled={updateDPP.isPending}>
              {updateDPP.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────────────── */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-[2rem] border-primary/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl font-black">Delete DPP?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              This will permanently delete the practice paper scheduled for
              <strong className="text-foreground ml-1">
                {dppToDelete?.date && format(new Date(dppToDelete.date), "PPP")}
              </strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="h-12 rounded-xl font-bold border-primary/10 hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="h-12 rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20">
              {deleteDPP.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
