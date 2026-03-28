import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Timer as TimerIcon,
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
        <div className="bg-card border border-primary/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" /> {title}
                </h4>
                <span className="text-[8px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">
                    {totalSeconds > 0 ? `${formatDisplay(totalSeconds)} total` : 'No data'}
                </span>
            </div>

            {chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 sm:py-14 space-y-3 opacity-40">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                        No data recorded yet
                    </p>
                </div>
            ) : (
                <>
                    <div className="relative h-[220px] sm:h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius="55%"
                                    outerRadius="80%"
                                    paddingAngle={3}
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="font-mono text-xl sm:text-2xl font-black text-foreground leading-none">{formatDisplay(totalSeconds)}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mt-1">total</p>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-2.5 border-t border-primary/5 pt-4">
                        {chartData.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[10px] font-bold gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                    <span className={`truncate ${entry.isUntagged ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                                        {entry.icon} {entry.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-mono text-primary">{formatDisplay(entry.seconds)}</span>
                                    <span className="text-muted-foreground opacity-50 tabular-nums w-10 text-right">{entry.pct.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const BreakdownListCard = ({ title, stats, icon: Icon }: any) => {
    const totalSeconds = stats?.totalSeconds || 0;
    const untaggedSeconds = stats?.untaggedSeconds || 0;
    const subjects = stats?.subjects || [];

    return (
        <div className="bg-card border border-primary/5 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{title}</h3>
                </div>
            </div>

            {totalSeconds === 0 ? (
                <p className="text-[10px] text-center text-muted-foreground opacity-40 font-bold uppercase py-8">
                    No data recorded yet.
                </p>
            ) : (
                <div className="space-y-1">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-primary/5 rounded-xl sm:rounded-2xl mb-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl shrink-0">
                                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Overview</p>
                                <p className="text-xs sm:text-sm font-black text-foreground truncate">Total Time Tracked</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                            <p className="font-mono text-base sm:text-xl font-black text-primary">{formatTime(totalSeconds)}</p>
                            <p className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{formatDisplay(totalSeconds)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                        <div className="h-px flex-1 bg-primary/5" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Breakdown</span>
                        <div className="h-px flex-1 bg-primary/5" />
                    </div>

                    {untaggedSeconds > 0 && (
                        <div className="space-y-1.5 py-3 border-b border-primary/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: UNTAGGED_COLOR }} />
                                    <span className="text-xs font-black text-foreground/70 truncate">⏱️ General (Untagged)</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                    <span className="font-mono text-xs font-black text-muted-foreground">{formatDisplay(untaggedSeconds)}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground opacity-40 tabular-nums">
                                        {((untaggedSeconds / totalSeconds) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${(untaggedSeconds / totalSeconds) * 100}%`, backgroundColor: UNTAGGED_COLOR }} />
                            </div>
                        </div>
                    )}

                    {subjects
                        .filter((s: any) => (s.totalStudySeconds || 0) > 0)
                        .map((s: any, i: number) => {
                            const barColor = s.color || CHART_COLORS[i % CHART_COLORS.length];
                            const pct = totalSeconds > 0 ? (s.totalStudySeconds / totalSeconds) * 100 : 0;
                            return (
                                <div key={s._id} className="space-y-1.5 py-3 border-b border-primary/5 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: barColor }} />
                                            <span className="text-sm">{s.icon || '📚'}</span>
                                            <span className="text-xs font-black text-foreground/80 truncate">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className="font-mono text-xs font-black text-primary">{formatDisplay(s.totalStudySeconds)}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground opacity-40 tabular-nums">{pct.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: barColor }} />
                                    </div>
                                    
                                    {s.chapters?.some((c: any) => (c.totalStudySeconds || 0) > 0) && (
                                        <div className="pl-4 border-l-2 border-primary/10 ml-3 space-y-1 pt-1">
                                            {s.chapters
                                                .filter((c: any) => (c.totalStudySeconds || 0) > 0)
                                                .map((c: any) => (
                                                    <div key={c._id} className="flex justify-between items-center text-[9px] font-bold text-muted-foreground gap-2">
                                                        <span className="truncate">{c.name}</span>
                                                        <span className="tabular-nums opacity-60 shrink-0">
                                                            {Math.floor(c.totalStudySeconds / 60)}m {c.totalStudySeconds % 60}s
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────────────

export default function TimerPage() {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');

    const { data: routeSubjects } = useSubjects();
    const { data: routeChapters, isLoading: chaptersLoading } = useChapters(selectedSubject);
    
    // NEW TimerStats structure: { allTime: DailyTimerStats, daily: DailyTimerStats[] }
    const { data: statsData } = useTimerStats();
    const queryClient = useQueryClient();

    const [selectedDate, setSelectedDate] = useState<string>('');

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

    // Tick
    useEffect(() => {
        let interval: any = null;
        if (isActive) interval = setInterval(() => setSeconds(p => p + 1), 1000);
        return () => { if (interval) clearInterval(interval); };
    }, [isActive]);

    const handleStart = () => { if (!startTime) setStartTime(new Date()); setIsActive(true); };
    const handlePause = () => setIsActive(false);
    const handleReset = () => { setIsActive(false); setSeconds(0); setStartTime(null); };

    const handleStop = async () => {
        if (seconds < 10) { toast.error('Session too short to record.'); handleReset(); return; }
        try {
            await api.post('/timer/session', {
                subjectId: selectedSubject || undefined,
                chapterId: selectedChapter || undefined,
                duration: seconds,
                startTime,
                endTime: new Date(),
            });
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            queryClient.invalidateQueries({ queryKey: ['timerStats'] });
            if (selectedSubject) queryClient.invalidateQueries({ queryKey: ['chapters', selectedSubject] });
            toast.success('Study session recorded!');
            handleReset();
        } catch { toast.error('Failed to save session.'); }
    };

    const activeSubject = (routeSubjects as any[])?.find((s: any) => s._id === selectedSubject);

    return (
        <div className="max-w-6xl mx-auto space-y-5 md:space-y-8 animate-in fade-in duration-700 pb-24 px-3 sm:px-4 md:px-0">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 backdrop-blur-md px-5 py-5 sm:px-8 sm:py-6 rounded-2xl sm:rounded-[2.5rem] border border-primary/5 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Neural Clock</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                    <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">Module Timer</h1>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed hidden sm:block">Precision time tracking for hyper-focused learning blocks</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger className="h-12 sm:h-auto rounded-xl border-primary/20 bg-background/50 font-bold px-4 text-xs">
                            <SelectValue placeholder="Select Daily Date" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {statsData?.daily?.map(day => (
                                <SelectItem key={day.date} value={day.date!} className="rounded-lg text-xs font-bold">
                                    {day.date}
                                </SelectItem>
                            ))}
                            {(!statsData?.daily || statsData.daily.length === 0) && (
                                <SelectItem value="today" disabled className="rounded-lg text-xs font-bold">Today (No data)</SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    {allTimeStats.totalSeconds > 0 && (
                        <div className="flex items-center gap-3 bg-primary/10 border border-primary/10 rounded-xl sm:rounded-2xl px-4 py-2 sm:py-2.5">
                            <Clock className="h-4 w-4 text-primary shrink-0" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">All-Time Total</p>
                                <p className="font-mono text-base font-black text-primary leading-none">{formatDisplay(allTimeStats.totalSeconds)}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main Grid ────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 md:gap-8 items-start">

                {/* ══ LEFT: Timer + Breakdowns ══ */}
                <div className="xl:col-span-7 space-y-5 md:space-y-6">

                    {/* ── Active Session Clock ─────────────────────────────────── */}
                    <div className="bg-primary text-primary-foreground rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-2xl shadow-primary/20 relative overflow-hidden flex flex-col items-center justify-center text-center">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 bg-white/20 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-16 -right-16 w-64 sm:w-96 h-64 sm:h-96 bg-white/20 rounded-full blur-[80px]" />
                        </div>

                        <div className="relative z-10 w-full space-y-5 sm:space-y-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                                    <TimerIcon className="h-6 w-6 sm:h-9 sm:w-9 text-white animate-pulse" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${activeSubject ? 'bg-white/15 text-white/90' : 'bg-white/5 text-white/35'}`}>
                                    {activeSubject ? `${activeSubject.icon || '📚'} ${activeSubject.name}` : '⏱️ Untagged Session'}
                                </span>
                            </div>

                            <h2 className="font-mono text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter drop-shadow-2xl leading-none">
                                {formatTime(seconds)}
                            </h2>

                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
                                <div className="col-span-2 flex justify-center">
                                    {!isActive ? (
                                        <Button onClick={handleStart}
                                            className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 rounded-2xl sm:rounded-3xl bg-white text-primary hover:bg-white/90 font-black text-base sm:text-lg shadow-2xl active:scale-95 transition-all">
                                            <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" /> START SESSION
                                        </Button>
                                    ) : (
                                        <Button onClick={handlePause}
                                            className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 font-black text-base sm:text-lg active:scale-95 transition-all">
                                            <Pause className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" /> PAUSE
                                        </Button>
                                    )}
                                </div>

                                <Button onClick={handleStop} disabled={seconds < 10}
                                    className="h-13 sm:h-14 px-5 sm:px-10 rounded-2xl sm:rounded-3xl bg-red-500 text-white hover:bg-red-600 font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all disabled:opacity-30 disabled:scale-100">
                                    <CheckCircle2 className="h-5 w-5 mr-1.5 shrink-0" />
                                    <span className="hidden xs:inline">STOP &amp; </span>LOG
                                </Button>

                                <Button variant="ghost" onClick={handleReset}
                                    className="h-13 sm:h-14 rounded-2xl sm:rounded-3xl bg-white/5 text-white hover:bg-white/10 active:rotate-180 transition-all duration-700 flex items-center justify-center gap-2 font-black text-sm">
                                    <RotateCcw className="h-5 w-5" />
                                    <span className="sm:hidden">RESET</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* TWO BREAKDOWN LISTS STACKED */}
                    <BreakdownListCard title="Daily Breakdown" stats={dailyStats} icon={CalendarDays} />
                    <BreakdownListCard title="All-Time Breakdown" stats={allTimeStats} icon={Globe} />

                </div>

                {/* ══ RIGHT: Config + Donut Charts ══ */}
                <div className="xl:col-span-5 space-y-5 md:space-y-6">

                    {/* Session Config */}
                    <div className="bg-card border border-primary/5 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <Layers className="h-5 w-5 text-primary" /> Session Config
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Assign focus and tagging</p>
                            </div>
                            {(selectedSubject || selectedChapter) && (
                                <Button variant="ghost" size="sm"
                                    onClick={() => { setSelectedSubject(''); setSelectedChapter(''); }}
                                    className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive h-7 px-2 rounded-lg">
                                    <X className="h-3 w-3 mr-1" /> Untag
                                </Button>
                            )}
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Target Module (Subject)</label>
                                <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setSelectedChapter(''); }}>
                                    <SelectTrigger className="h-14 rounded-2xl border-primary/10 bg-primary/5 font-bold p-6">
                                        <SelectValue placeholder="Select Subject (optional)" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {(routeSubjects as any[])?.map((s: any) => (
                                            <SelectItem key={s._id} value={s._id} className="rounded-xl font-bold py-3">
                                                <div className="flex items-center gap-2">
                                                    <span>{s.icon || '📚'}</span><span>{s.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Focus Node (Chapter)</label>
                                <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject || chaptersLoading}>
                                    <SelectTrigger className="h-14 rounded-2xl border-primary/10 bg-primary/5 font-bold p-6 disabled:opacity-30">
                                        <SelectValue placeholder={selectedSubject ? 'Select Chapter (Optional)' : 'Select Subject First'} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {(routeChapters as any[])?.map((c: any) => (
                                            <SelectItem key={c._id} value={c._id} className="rounded-xl font-bold py-3">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* TWO DONUT CHARTS STACKED */}
                    <DonutChartCard title="Daily Distribution" stats={dailyStats} icon={CalendarDays} />
                    <DonutChartCard title="All-Time Distribution" stats={allTimeStats} icon={Globe} />

                </div>
            </div>
        </div>
    );
}
