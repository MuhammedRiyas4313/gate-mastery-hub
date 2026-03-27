import { useExams } from "@/hooks/useExams";
import { useState } from "react";
import { Plus, Loader2, Save, Trash2, CalendarDays, Zap, Clock, Trophy, Target, Settings2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function Exams() {
  const { data: exams, isLoading, addExam, updateExam, deleteExam } = useExams();
  
  const [editOpen, setEditOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'GATE'
  });

  const handleCreateNew = () => {
    setSelectedExam(null);
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'GATE'
    });
    setEditOpen(true);
  };

  const handleEdit = (exam: any) => {
    setSelectedExam(exam);
    setForm({
      title: exam.title,
      date: new Date(exam.date).toISOString().split('T')[0],
      category: exam.category || 'GATE'
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.date) {
        toast.error("All mandatory trajectories must be mapped.");
        return;
    }

    if (selectedExam) {
      updateExam.mutate({ ...form, id: selectedExam._id }, {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Exam timeline recalculated.");
        }
      });
    } else {
      addExam.mutate(form, {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("New exam objective secured.");
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteExam.mutate(id, {
        onSuccess: () => toast.success("Timeline purged.")
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-20 px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-primary/5 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-0.5 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">Temporal Management</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
           </div>
           <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">Exams & Targets</h1>
           <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-sm mx-auto md:mx-0 leading-relaxed">Coordinate your final objectives and countdowns.</p>
        </div>

        <Button onClick={handleCreateNew} className="w-full md:w-auto rounded-2xl h-14 md:h-12 font-black shadow-xl shadow-primary/20 px-8 bg-primary hover:scale-105 transition-all text-xs md:text-sm flex items-center justify-center shrink-0">
          <Plus className="h-4 w-4 md:h-5 md:w-5 mr-3" /> Add Exam
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {exams?.map((exam: any) => {
            const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
                <div key={exam._id} className="group relative bg-card/40 backdrop-blur-xl border border-primary/5 hover:border-primary/20 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8">
                   <div className="flex items-center gap-4 md:gap-6 text-left">
                      <div className="h-12 w-12 md:h-16 md:w-16 bg-primary/5 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                         <Trophy className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                      <div className="space-y-0.5 md:space-y-1 min-w-0">
                         <p className="text-[9px] md:text-[10px] font-black uppercase text-primary tracking-widest opacity-60 leading-none truncate">{exam.category || 'Objective'}</p>
                         <h3 className="text-lg md:text-2xl font-black text-foreground truncate leading-tight">{exam.title}</h3>
                         <p className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                            <CalendarDays className="h-3 w-3" /> {format(new Date(exam.date), "PPP")}
                         </p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 pt-4 md:pt-0 border-t md:border-none border-primary/5 w-full md:w-auto">
                      <div className="text-left md:text-right">
                         <p className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground opacity-40 tracking-widest mb-0.5">Impact Countdown</p>
                         <div className="flex items-baseline gap-1">
                            <span className={`text-2xl md:text-4xl font-black ${daysLeft < 30 ? 'text-destructive' : 'text-foreground'}`}>{daysLeft}</span>
                            <span className="text-[9px] md:text-[10px] uppercase font-black opacity-30">Days Remaining</span>
                         </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <Button variant="ghost" size="icon" onClick={() => handleEdit(exam)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border border-primary/5 hover:bg-primary/5">
                            <Edit3 className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleDelete(exam._id)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border border-destructive/5 hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-destructive/60" />
                         </Button>
                      </div>
                   </div>
                </div>
            );
         })}

         {exams?.length === 0 && (
            <div className="p-20 text-center border-2 border-dashed border-primary/10 rounded-[3rem] bg-card/10">
               <Zap className="h-12 w-12 text-primary/20 mx-auto mb-6" />
               <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No exam missions assigned. Add your target above.</p>
            </div>
         )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
           <DialogHeader className="mb-8">
             <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                   <Settings2 className="h-6 w-6" />
                </div>
                <DialogTitle className="font-heading text-3xl font-black tracking-tight">
                  {selectedExam ? 'Adjust Mission' : 'Secure Target'}
                </DialogTitle>
             </div>
           </DialogHeader>
           
           <div className="space-y-8">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Objective Title</Label>
                 <Input 
                   placeholder="Ex: GATE 2026 CS & IT" 
                   className="h-14 rounded-2xl bg-primary/5 border-primary/10 px-6 font-bold"
                   value={form.title} 
                   onChange={(e) => setForm({ ...form, title: e.target.value })} 
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Target Date</Label>
                    <Input 
                      type="date"
                      className="h-14 rounded-2xl bg-primary/5 border-primary/10 px-6 font-black"
                      value={form.date} 
                      onChange={(e) => setForm({ ...form, date: e.target.value })} 
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Domain</Label>
                    <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                       <SelectTrigger className="h-14 rounded-2xl bg-primary/5 border-primary/10 font-black px-6">
                          <SelectValue placeholder="Select" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="GATE">GATE CS</SelectItem>
                          <SelectItem value="ISRO">ISRO</SelectItem>
                          <SelectItem value="BARC">BARC</SelectItem>
                          <SelectItem value="NIELIT">NIELIT</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <Button variant="ghost" onClick={() => setEditOpen(false)} className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] opacity-50">Discard</Button>
                 <Button onClick={handleSave} className="h-14 flex-[2] rounded-2xl font-black text-lg bg-primary shadow-2xl shadow-primary/30">
                    {updateExam.isPending || addExam.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 mr-3" />}
                    {selectedExam ? 'Update Timeline' : 'Finalize Objective'}
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
