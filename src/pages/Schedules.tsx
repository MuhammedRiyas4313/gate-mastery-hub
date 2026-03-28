import { useState } from 'react';
import { useSchedules, useUploadSchedule, useDeleteSchedule } from '@/hooks/useSchedules';
import { FileText, Calendar, Upload, Download, Trash2, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Schedules() {
    const { data: schedules, isLoading } = useSchedules();
    const { mutate: uploadSchedule, isPending: isUploading } = useUploadSchedule();
    const { mutate: deleteSchedule, isPending: isDeleting } = useDeleteSchedule();

    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [isUploadMode, setIsUploadMode] = useState(false);
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startDate || !endDate || !file) {
            toast.error('Please fill all fields and select a valid date range');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('startDate', format(startDate, 'yyyy-MM-dd'));
        formData.append('endDate', format(endDate, 'yyyy-MM-dd'));
        formData.append('file', file);

        uploadSchedule(formData, {
            onSuccess: () => {
                toast.success('Schedule uploaded successfully!');
                setIsUploadMode(false);
                setTitle('');
                setStartDate(undefined);
                setEndDate(undefined);
                setFile(null);
            },
            onError: () => {
                toast.error('Failed to upload schedule.');
            }
        });
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Upcoming':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'Ongoing':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'Completed':
                return 'bg-success/10 text-success border-success/20';
            default:
                return 'bg-muted/10 text-muted-foreground border-muted/20';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Schedules...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
            {/* Header Action */}
            {!isUploadMode && (
                <div className="flex justify-end">
                    <Button onClick={() => setIsUploadMode(true)} className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Upload Schedule
                    </Button>
                </div>
            )}

            {/* Upload Section */}
            {isUploadMode && (
                <div className="bg-card border border-primary/10 rounded-[2.5rem] p-8 md:p-10 shadow-lg animate-in fade-in slide-in-from-top-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Upload className="text-primary w-6 h-6" />
                        <h2 className="text-xl font-black">Upload New Document</h2>
                    </div>
                    
                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Schedule Title</label>
                            <Input 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Week 4: Algorithms Revision"
                                className="h-14 rounded-2xl border-primary/10 bg-background/50 font-bold px-6"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Document File (PDF/Image)</label>
                            <Input 
                                type="file"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                className="h-14 rounded-2xl border-primary/10 bg-background/50 font-bold px-6 pt-3.5"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Start Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border-primary/10 bg-background/50 font-bold px-6 text-left justify-start",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>Pick standard start date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarUI
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">End Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-14 rounded-2xl border-primary/10 bg-background/50 font-bold px-6 text-left justify-start",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : <span>Pick cycle end date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarUI
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        disabled={(date) => startDate ? date < startDate : false}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-black" onClick={() => setIsUploadMode(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUploading} className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl">
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                                Upload Document
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Split View Container */}
            {!selectedSchedule ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules?.length === 0 ? (
                        <div className="md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center opacity-50 space-y-4">
                            <Calendar className="w-12 h-12 text-muted-foreground" />
                            <p className="text-xs font-black uppercase tracking-widest">No schedules uploaded yet.</p>
                        </div>
                    ) : (
                        [...(schedules || [])].reverse().map((schedule) => (
                            <div 
                                key={schedule._id} 
                                onClick={() => setSelectedSchedule(schedule)}
                                className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-primary/5 p-8 flex flex-col gap-6 shadow-sm hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(schedule.status || 'Upcoming')}`}>
                                        {schedule.status || 'Upcoming'}
                                    </span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                        onClick={(e) => { e.stopPropagation(); deleteSchedule(schedule._id); }}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div>
                                    <h3 className="text-xl font-heading font-black leading-tight line-clamp-2" title={schedule.title}>{schedule.title}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-2 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> 
                                        {new Date(schedule.startDate).toLocaleDateString()} — {new Date(schedule.endDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="mt-auto h-12 rounded-2xl bg-primary/5 text-primary font-black text-xs flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 border border-primary/10">
                                    <FileText className="w-4 h-4" /> View Details
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 items-start animate-in fade-in duration-500">
                    {/* Left Column - List View */}
                    <div className="flex flex-col gap-3 max-h-[85vh] overflow-y-auto pr-2 pb-10 custom-scrollbar">
                        <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 py-2 mb-2 flex items-center justify-between border-b border-primary/5">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">All Schedules</span>
                        </div>
                        {[...(schedules || [])].reverse().map((schedule) => (
                            <div 
                                key={schedule._id} 
                                onClick={() => setSelectedSchedule(schedule)}
                                className={cn(
                                    "rounded-3xl border p-5 cursor-pointer transition-all duration-300 text-left",
                                    selectedSchedule._id === schedule._id 
                                        ? "bg-card border-primary ring-4 ring-primary/10 shadow-xl" 
                                        : "bg-card/40 backdrop-blur-md border-primary/5 hover:border-primary/50 shadow-sm"
                                )}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-sm font-heading font-black leading-tight line-clamp-2 pr-2">{schedule.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${getStatusStyles(schedule.status || 'Upcoming')}`}>
                                        {schedule.status || 'Upcoming'}
                                    </span>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" /> 
                                    {new Date(schedule.startDate).toLocaleDateString()} — {new Date(schedule.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right Column - Detail Viewer */}
                    <div className="bg-card backdrop-blur-md rounded-[2.5rem] border border-primary/10 p-6 md:p-8 flex flex-col gap-6 shadow-2xl sticky top-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${getStatusStyles(selectedSchedule.status || 'Upcoming')}`}>
                                    {selectedSchedule.status || 'Upcoming'}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-heading font-black leading-tight pr-4">{selectedSchedule.title}</h2>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> 
                                    {new Date(selectedSchedule.startDate).toLocaleDateString()} — {new Date(selectedSchedule.endDate).toLocaleDateString()}
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                className="rounded-full h-12 w-12 p-0 text-muted-foreground hover:text-foreground shrink-0 border-primary/10 bg-background/50 hover:bg-muted/80 transition-all"
                                onClick={() => setSelectedSchedule(null)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* File Viewer Box */}
                        <div className="w-full bg-[#0a0a0a] rounded-3xl border border-primary/10 overflow-hidden flex flex-col items-center justify-center min-h-[400px] h-[58vh] relative group">
                             {(() => {
                                 const fileUrl = selectedSchedule.fileUrl.startsWith('http') ? selectedSchedule.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${selectedSchedule.fileUrl}`;
                                 const isImage = fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)/i) != null || fileUrl.includes('image/upload');
                                 
                                 if (isImage) {
                                     return <img src={fileUrl} alt={selectedSchedule.title} className="w-full h-full object-contain" />;
                                 } else {
                                     return <iframe src={fileUrl} className="w-full h-full border-0 bg-white" title={selectedSchedule.title} />;
                                 }
                             })()}
                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                    href={selectedSchedule.fileUrl.startsWith('http') ? selectedSchedule.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${selectedSchedule.fileUrl}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="h-10 px-5 rounded-xl bg-black/50 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white hover:text-black transition-all"
                                >
                                    <Download className="w-3 h-3" /> Fullscreen
                                </a>
                             </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                             <Button 
                                variant="ghost" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 font-black text-xs rounded-xl h-12 px-6"
                                onClick={() => {
                                    deleteSchedule(selectedSchedule._id);
                                    setSelectedSchedule(null);
                                }}
                                disabled={isDeleting}
                             >
                                <Trash2 className="w-4 h-4 mr-2" /> DELETE DOCUMENT
                             </Button>

                             <a 
                                href={selectedSchedule.fileUrl.startsWith('http') ? selectedSchedule.fileUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${selectedSchedule.fileUrl}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:shadow-primary/20 transition-all hover:-translate-y-0.5"
                             >
                                <Download className="w-4 h-4" /> Download Raw File
                             </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
