import { useState, useEffect, useMemo } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    BookOpen,
    Layers,
    Clock,
    X,
    Zap,
    BarChart3,
    CalendarDays,
    Globe
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSubjects } from '@/hooks/useSubjects';
import { useTimerStats } from '@/hooks/useTimerStats';
import api from '@/lib/rest-client';
import { toast } from 'sonner';
import { useChapters } from '@/hooks/useChapters';

// ── Colour palette ─────────────────────────────────────────────────────────────
const CHART_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#f97316', '#14b8a6',
    '#e11d48', '#84cc16',
];
const UNTAGGED_COLOR = '#94a3b8';

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const formatDisplay = (s: number) => {
    if (s <= 0) return '0m';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        const d = payload[0].payload;
        return (
            <div className="bg-card border border-primary/10 rounded-2xl px-4 py-3 shadow-xl text-xs font-bold">
                <p className="text-foreground mb-1">{d.icon} {d.name}</p>
                <p className="text-primary">{formatDisplay(d.seconds)}</p>
                <p className="text-muted-foreground opacity-60 text-[10px]">{d.pct.toFixed(1)}% of total</p>
            </div>
        );
    }
    return null;
};

// ── Local Components ─────────────────────────────────────────────────────────
const DonutChartCard = ({ title, stats, icon: Icon }: any) => {
    const totalSeconds = stats?.totalSeconds || 0;
    const untaggedSeconds = stats?.untaggedSeconds || 0;
    
    const chartData = useMemo(() => {
        if (!stats || totalSeconds === 0) return [];
        const slices = (stats.subjects || [])
            .filter((s: any) => (s.totalStudySeconds || 0) > 0)
            .map((s: any, i: number) => ({
                name: s.name,
                icon: s.icon || '📚',
                seconds: s.totalStudySeconds,
                pct: (s.totalStudySeconds / totalSeconds) * 100,
                color: s.color || CHART_COLORS[i % CHART_COLORS.length],
                isUntagged: false,
            }));
        if (untaggedSeconds > 0) {
            slices.unshift({ name: 'General (Untagged)', icon: '⏱️', seconds: untaggedSeconds, pct: (untaggedSeconds / totalSeconds) * 100, color: UNTAGGED_COLOR, isUntagged: true });
        }
        return slices;
    }, [stats, totalSeconds, untaggedSeconds]);

    return (
        <div className="bg-card border border-primary/5 rounded-3xl p-5 shadow-sm space-y-3 flex-1">
            <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    <Icon className="h-3 w-3" /> {title}
                </h4>
                <span className="font-mono text-[10px] font-black text-primary">
                    {formatDisplay(totalSeconds)}
                </span>
            </div>

            {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 opacity-30">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
            ) : (
                <div className="relative h-[120px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%" cy="50%"
                                innerRadius="65%"
                                outerRadius="90%"
                                paddingAngle={2}
                                dataKey="pct"
                                strokeWidth={0}
                            >
                                {chartData.map((entry: any, i: number) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-foreground opacity-50 uppercase tracking-tighter">SHARE</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const IntegratedTimer = ({ seconds, isActive, isPaused, isStopping, handleStart, handlePause, handleResume, handleStop, handleReset, selectedSubject, setSelectedSubject, selectedChapter, setSelectedChapter, routeSubjects, routeChapters, chaptersLoading }: any) => {
    return (
        <div className="bg-primary text-primary-foreground rounded-[3rem] shadow-3xl relative overflow-hidden flex flex-col border border-primary/10">
             {/* ── TOP SECTION: TIMER DISPLAY (CENTERED STACK) ────────────────── */}
             <div className="p-8 sm:p-10 relative z-10 flex flex-col items-center text-center">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40 block">Active Session Time</span>
                    {isPaused && (
                        <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse border border-amber-500/20">PAUSED</span>
                    )}
                 </div>
                 
                 <h2 className="font-mono text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter tabular-nums leading-none mb-8 text-white">
                    {formatTime(seconds)}
                 </h2>

                 <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl px-4">
                    {!isActive ? (
                        <Button 
                            onClick={handleStart} 
                            className="bg-white text-primary hover:bg-primary-foreground hover:scale-[1.03] font-black rounded-2xl px-10 py-6 h-auto shadow-xl transition-all text-xs tracking-[0.3em] min-w-[200px] border-none active:scale-95"
                        >
                            <Play className="h-5 w-5 fill-current mr-2" /> START FOCUS
                        </Button>
                    ) : (
                             <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                                {isPaused ? (
                                    <Button 
                                        onClick={handleResume} 
                                        className="bg-emerald-500 text-white hover:bg-emerald-600 font-black rounded-2xl px-10 py-6 h-auto shadow-xl shadow-emerald-500/30 active:scale-95 transition-all text-xs tracking-[0.3em] min-w-[200px] border-none"
                                    >
                                        <Play className="h-5 w-5 fill-current mr-2" /> RESUME
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handlePause} 
                                        className="bg-amber-500 text-white hover:bg-amber-600 font-black rounded-2xl px-10 py-6 h-auto shadow-xl shadow-amber-500/30 active:scale-95 transition-all text-xs tracking-[0.3em] min-w-[200px] border-none"
                                    >
                                        <Pause className="h-5 w-5 fill-current mr-2" /> PAUSE
                                    </Button>
                                )}
                                
                                <Button 
                                    onClick={handleStop} 
                                    disabled={isStopping}
                                    className="bg-rose-500 text-white hover:bg-rose-600 font-black rounded-2xl px-10 py-6 h-auto shadow-xl shadow-rose-500/30 active:scale-95 transition-all text-xs tracking-[0.2em] min-w-[200px] border-none disabled:opacity-50 disabled:active:scale-100"
                                >
                                    <CheckCircle2 className="h-5 w-5 mr-2" /> {isStopping ? 'SAVING...' : 'STOP SESSION'}
                                </Button>
                                <Button 
                                    onClick={handleReset} 
                                    variant="outline" 
                                    className="h-12 bg-white/10 hover:bg-white/20 border-white/20 rounded-2xl text-white font-black tracking-widest text-[10px] px-8"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" /> RESET
                                </Button>
                             </div>
                    )}
                 </div>
                 
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.05] rounded-full blur-[100px] pointer-events-none animate-pulse" />
             </div>

             {/* ── BOTTOM SECTION: CONFIGURATION (BLACK) ───────────────────── */}
             <div className="bg-black p-5 sm:p-8 relative z-10 group">
                 <div className="flex flex-col lg:flex-row items-end gap-5 w-full">
                     <div className="flex-1 space-y-2 w-full">
                         <div className="flex items-center justify-between px-1.5">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white opacity-40 flex items-center gap-2">
                                <Layers className="h-3 w-3" /> Focus Module
                             </label>
                         </div>
                         <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setSelectedChapter(''); }}>
                            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 font-bold px-5 text-sm text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-zinc-900 border-white/5 text-white">
                                {(routeSubjects as any[])?.map((s: any) => (
                                    <SelectItem key={s._id} value={s._id} className="rounded-lg font-bold py-3.5 focus:bg-primary focus:text-white">
                                        {s.icon} {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                     </div>

                     <div className="flex-1 space-y-2 w-full">
                         <div className="flex items-center justify-between px-1.5">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white opacity-40 flex items-center gap-2">
                                 <BookOpen className="h-3 w-3" /> Current Chapter
                             </label>
                         </div>
                         <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject || chaptersLoading}>
                            <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 font-black px-5 text-sm text-white backdrop-blur-md disabled:opacity-20 text-left hover:bg-white/10 hover:border-white/20 transition-all">
                                <SelectValue placeholder={selectedSubject ? 'Select Chapter' : 'Subject First'} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-zinc-900 border-white/5 text-white">
                                {(routeChapters as any[])?.map((c: any) => (
                                    <SelectItem key={c._id} value={c._id} className="rounded-lg font-bold py-3.5 focus:bg-primary focus:text-white">{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                         </Select>
                     </div>

                     {(selectedSubject || selectedChapter) && (
                         <div className="shrink-0 animate-in fade-in zoom-in-95 duration-300 w-full lg:w-auto">
                            <button 
                                onClick={() => { setSelectedSubject(''); setSelectedChapter(''); }}
                                className="h-12 px-6 flex items-center justify-center gap-2 text-[9px] font-black tracking-widest text-rose-500/60 hover:text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all group/clear active:scale-95 w-full lg:w-auto border border-rose-500/10"
                            >
                                <X className="h-3 w-3 group-hover/clear:rotate-90 transition-transform" /> CLEAR TAGS
                            </button>
                         </div>
                     )}
                 </div>
                 
                 <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
             </div>
        </div>
    );
};

const SessionList = ({ sessions }: { sessions: any[] }) => {
    return (
        <div className="bg-card border border-primary/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-5">
                <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Activity Timeline</h3>
                </div>
                <span className="text-[9px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">
                    {sessions.length} entries total
                </span>
            </div>

            <div className="space-y-1 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                {sessions.slice(0, 50).map((session, i) => (
                    <div key={session._id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-primary/5 group transition-all">
                         <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-background border border-primary/5 flex items-center justify-center text-lg shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                {session.subject?.icon || '⏱️'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-foreground/80 truncate">
                                    {session.subject?.name || 'General Session'}
                                </p>
                                <p className="text-[9px] font-bold text-muted-foreground opacity-50 truncate">
                                    {session.chapter?.name || 'Untagged Focus'}
                                </p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 shrink-0 ml-4">
                            <div className="text-right">
                                <p className="font-mono text-sm font-black text-primary leading-none">
                                    {formatDisplay(session.duration)}
                                </p>
                                <p className="text-[8px] font-bold text-muted-foreground opacity-40 uppercase tracking-tighter mt-1">
                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                         </div>
                    </div>
                ))}
                
                {sessions.length === 0 && (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center">
                        <Clock className="h-12 w-12 mb-4 text-muted-foreground" />
                        <p className="text-xs font-black uppercase tracking-widest">No Focus entries yet</p>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--primary), 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--primary), 0.2);
                }
            `}</style>

            {sessions.length > 10 && (
                 <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30">
                    Scroll to view more entries
                 </p>
            )}
        </div>
    );
};

const BreakdownListCard = ({ title, stats, icon: Icon }: any) => {
    const totalSeconds = stats?.totalSeconds || 0;
    const untaggedSeconds = stats?.untaggedSeconds || 0;
    
    const displaySubjects = useMemo(() => {
        const list = [...(stats?.subjects || [])];
        if (untaggedSeconds > 0) {
            list.unshift({
                _id: 'untagged',
                name: 'General Session',
                icon: '⏱️',
                totalStudySeconds: untaggedSeconds,
                color: UNTAGGED_COLOR
            });
        }
        return list;
    }, [stats, untaggedSeconds]);

    return (
        <div className="bg-card border border-primary/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{title}</h3>
                </div>
                <p className="font-mono text-base font-black text-primary">{formatDisplay(totalSeconds)}</p>
            </div>

            <div className="space-y-4">
                {displaySubjects.length === 0 ? (
                    <p className="text-[10px] text-center text-muted-foreground opacity-40 font-bold uppercase py-10">No focus data recorded.</p>
                ) : (
                    displaySubjects.map((s: any, i: number) => {
                        const barColor = s.color || CHART_COLORS[i % CHART_COLORS.length];
                        const pct = totalSeconds > 0 ? (s.totalStudySeconds / totalSeconds) * 100 : 0;
                        const isRealSubject = s._id !== 'untagged';
                        
                        return (
                            <div key={s._id} className={`space-y-3 ${isRealSubject ? 'bg-primary/[0.03] p-5 rounded-3xl border border-primary/5' : ''}`}>
                                <div className="flex items-center justify-between text-[11px] font-black">
                                    <span className="truncate opacity-70 flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: barColor }} />
                                        {s.icon} {s.name}
                                    </span>
                                    <span className="tabular-nums text-primary">{formatDisplay(s.totalStudySeconds)}</span>
                                </div>
                                <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, backgroundColor: barColor }} />
                                </div>

                                {/* NESTED CHAPTER BREAKDOWN */}
                                {isRealSubject && (
                                    <div className="pl-4 ml-1 border-l border-primary/10 mt-3 space-y-2">
                                        {(s.chapters || []).map((ch: any) => (
                                            <div key={ch._id} className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/80">
                                                <span className="truncate flex items-center gap-2">
                                                    <BookOpen className="h-2 w-2 opacity-30" /> {ch.name}
                                                </span>
                                                <span className="tabular-nums opacity-60">{formatDisplay(ch.totalStudySeconds)}</span>
                                            </div>
                                        ))}
                                        {(s.untaggedChapterSeconds || 0) > 0 && (
                                            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/60 italic">
                                                <span className="truncate flex items-center gap-2 opacity-50">
                                                    <Clock className="h-2 w-2 opacity-30" /> General Subject Focus
                                                </span>
                                                <span className="tabular-nums opacity-60">{formatDisplay(s.untaggedChapterSeconds)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────

import { useStore } from '@/store/useStore';

export default function TimerPage() {
    const activeTimer = useStore(state => state.activeTimer);
    const startGlobalTimer = useStore(state => state.startTimer);
    const pauseGlobalTimer = useStore(state => state.pauseTimer);
    const resumeGlobalTimer = useStore(state => state.resumeTimer);
    const stopGlobalTimer = useStore(state => state.stopTimer);

    const [seconds, setSeconds] = useState(0);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');

    const { data: routeSubjects } = useSubjects();
    const { data: routeChapters, isLoading: chaptersLoading } = useChapters(selectedSubject);
    
    // NEW TimerStats structure: { allTime: DailyTimerStats, daily: DailyTimerStats[] }
    const { data: statsData } = useTimerStats();
    const queryClient = useQueryClient();

    const [selectedDate, setSelectedDate] = useState<string>('');

    // Restore selection from active timer if it exists
    useEffect(() => {
        if (activeTimer) {
            if (activeTimer.subjectId) setSelectedSubject(activeTimer.subjectId);
            if (activeTimer.chapterId) setSelectedChapter(activeTimer.chapterId);
        }
    }, [activeTimer]);

    // Set default selectedDate to latest tracked day
    useEffect(() => {
        if (statsData?.daily && statsData.daily.length > 0 && !selectedDate) {
            setSelectedDate(statsData.daily[0].date!);
        }
    }, [statsData, selectedDate]);

    // Active daily stats
    const dailyStats = useMemo(() => {
        if (!statsData?.daily) return { totalSeconds: 0, untaggedSeconds: 0, subjects: [] };
        return statsData.daily.find(d => d.date === selectedDate) || { totalSeconds: 0, untaggedSeconds: 0, subjects: [] };
    }, [statsData, selectedDate]);

    // All time stats
    const allTimeStats = statsData?.allTime || { totalSeconds: 0, untaggedSeconds: 0, subjects: [] };

    // Tick & Persistence Sync
    useEffect(() => {
        if (!activeTimer) {
            setSeconds(0);
            return;
        }

        const update = () => {
          const accumulated = activeTimer.accumulatedTime || 0;
          if (activeTimer.isPaused) {
            setSeconds(Math.floor(accumulated / 1000));
            return;
          }
          const lastStarted = new Date(activeTimer.lastStartedTime).getTime();
          const now = Date.now();
          setSeconds(Math.floor((accumulated + (now - lastStarted)) / 1000));
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [activeTimer]);

    const handleStart = () => { 
        startGlobalTimer(selectedSubject || undefined, selectedChapter || undefined);
    };

    const handleReset = () => { 
        stopGlobalTimer();
        setSeconds(0); 
    };

    const saveSessionMutation = useMutation({
        mutationFn: async (sessionData: any) => {
            return api.post('/timer/session', sessionData);
        },
        onSuccess: async (_, variables) => {
            // Refetch needed data
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['subjects'] }),
                queryClient.invalidateQueries({ queryKey: ['timerStats'] }),
                variables.subjectId ? queryClient.invalidateQueries({ queryKey: ['chapters', variables.subjectId] }) : Promise.resolve()
            ]);

            toast.success('Study session recorded!');
            // Reset selectedDate so it will auto-select the latest date from fresh stats
            setSelectedDate(''); 
            handleReset();
        },
        onError: () => {
             toast.error('Failed to save session.'); 
        }
    });

    const handleStop = () => {
        if (seconds < 10) { toast.error('Session too short to record.'); handleReset(); return; }
        if (saveSessionMutation.isPending) return;

        const startTime = activeTimer?.startTime ? new Date(activeTimer.startTime) : new Date();
        saveSessionMutation.mutate({
            subjectId: activeTimer?.subjectId || undefined,
            chapterId: activeTimer?.chapterId || undefined,
            duration: seconds,
            startTime: startTime,
            endTime: new Date(),
        });
    };

    const activeSubject = (routeSubjects as any[])?.find((s: any) => s._id === (activeTimer?.subjectId || selectedSubject));
    const isActive = !!activeTimer;

    return (
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-1000 pb-24 px-3 sm:px-4 md:px-0">

            {/* ── ROW 1: Central Control & Analytics ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LARGE INTEGRATED TIMER (8/12) */}
                <div className="lg:col-span-8">
                    <IntegratedTimer 
                        seconds={seconds}
                        isActive={isActive}
                        isPaused={activeTimer?.isPaused}
                        isStopping={saveSessionMutation.isPending}
                        handleStart={handleStart}
                        handlePause={pauseGlobalTimer}
                        handleResume={resumeGlobalTimer}
                        handleStop={handleStop}
                        handleReset={handleReset}
                        selectedSubject={selectedSubject}
                        setSelectedSubject={setSelectedSubject}
                        selectedChapter={selectedChapter}
                        setSelectedChapter={setSelectedChapter}
                        routeSubjects={routeSubjects}
                        routeChapters={routeChapters}
                        chaptersLoading={chaptersLoading}
                    />
                </div>

                {/* VERTICAL CHARTS (4/12) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <DonutChartCard title="Today's Share" stats={dailyStats} icon={Zap} />
                    <DonutChartCard title="All-Time Distribution" stats={allTimeStats} icon={Globe} />
                </div>
            </div>

            {/* ── ROW 2: Statistics & Activity Log ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* BREAKDOWNS (8/12 - Perfectly aligned with Timer) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h2 className="text-xl font-black tracking-tight">Focus Performance</h2>
                        <Select value={selectedDate} onValueChange={setSelectedDate}>
                            <SelectTrigger className="w-[160px] h-8 rounded-xl border-primary/10 bg-card/40 backdrop-blur-md font-bold px-3 text-[9px] uppercase tracking-widest">
                                <CalendarDays className="h-3 w-3 mr-2 text-primary" />
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {statsData?.daily?.map(day => (
                                    <SelectItem key={day.date} value={day.date!} className="rounded-lg text-xs font-bold">{day.date}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <BreakdownListCard title="Today's Performance" stats={dailyStats} icon={CalendarDays} />
                        <BreakdownListCard title="All-Time Cumulative" stats={allTimeStats} icon={Globe} />
                    </div>
                </div>

                {/* ACTIVITY LOG (4/12 - Perfectly aligned with Charts) */}
                <div className="lg:col-span-4">
                    <div className="flex items-center px-1 mb-5 h-8">
                        <h2 className="text-xl font-black tracking-tight">Focus Log</h2>
                    </div>
                    <SessionList sessions={statsData?.sessions || []} />
                </div>
            </div>
        </div>
    );
}
