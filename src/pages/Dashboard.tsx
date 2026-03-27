import { useDashboard } from "@/hooks/useDashboard";
import {
   CheckCircle2,
   Circle,
   Clock,
   Flame,
   BookOpen,
   RefreshCw,
   Loader2,
   Award,
   Target,
   CalendarDays,
   ChevronRight,
   TrendingUp,
   BrainCircuit,
   Zap,
   Tag,
   Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
   const {
      data: dashboard,
      isLoading,
      error,
      toggleLecture,
      updateDPP,
      updateRevision
   } = useDashboard();

   const {
      topicsCompletedToday = [],
      revisionsToday = [],
      dppToday,
      pyqsToday = [],
      testsToday = [],
      weekendQuiz,
      recentQuizzes = [],
      gateCountdownDays,
      upcomingExams = [],
      subjectProgress = []
   } = dashboard || {};

   const scoreTrend = useMemo(() => {
      if (!recentQuizzes) return [];
      return recentQuizzes
         .flatMap((s: any) => s.quizzes.map((q: any) => ({
            date: s.date,
            title: q.title,
            id: q._id,
            pct: q.totalMarks > 0 ? Math.round((q.score / q.totalMarks) * 100) : 0
         })))
         .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
         .slice(-10);
   }, [recentQuizzes]);

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[500px]">
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="h-12 w-12 text-primary animate-spin" />
               <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Hub...</p>
            </div>
         </div>
      );
   }

   if (error || !dashboard) {
      return (
         <div className="p-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <Target className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Communication Break</h2>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Lost contact with the command center. Ensure your node server is running at port 5000.</p>
         </div>
      );
   }

   const handleToggleDPP = () => {
      if (!dppToday) return;
      const nextStatus = dppToday.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      updateDPP.mutate({ id: dppToday._id, status: nextStatus });
   };

   const handleRevisionAction = (id: string, status: string) => {
      updateRevision.mutate({ id, status });
   };

   return (
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">

         {/* ── Top Bar & Stats ──────────────────────────────────────────────── */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="sm:col-span-2 space-y-1 md:space-y-2 text-center sm:text-left">
               <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground">Command Center</h1>
               <p className="text-xs md:text-sm text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" /> {format(new Date(), "EEEE, do MMMM yyyy")}
               </p>
            </div>

            <Link to="/exams" className="bg-primary text-primary-foreground rounded-[2rem] p-5 md:p-6 shadow-xl shadow-primary/20 flex items-center justify-between group overflow-hidden relative transition-transform active:scale-95">
               <div className="relative z-10">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                     {upcomingExams?.[0]?.title || 'Primary Target'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                     <span className="text-3xl md:text-4xl font-black">{gateCountdownDays || 0}</span>
                     <span className="text-xs font-bold opacity-50 uppercase">Days</span>
                  </div>
               </div>
               <Target className="h-10 w-10 md:h-12 md:w-12 opacity-20 relative z-10 transition-transform group-hover:scale-125 group-hover:rotate-12" />
               <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </Link>

            <div className="bg-card/50 backdrop-blur-md border border-primary/10 rounded-[2rem] p-5 md:p-6 shadow-sm flex items-center justify-between group">
               <div>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Focus Streak</span>
                  <div className="flex items-baseline gap-1 mt-1">
                     <span className="text-3xl md:text-4xl font-black text-foreground">5</span>
                     <span className="text-xs font-bold text-muted-foreground uppercase">Days</span>
                  </div>
               </div>
               <Flame className="h-10 w-10 md:h-12 md:w-12 text-primary fill-primary/20 transition-all group-hover:scale-110 animate-pulse" />
            </div>
         </div>

         {/* ── Multiple Exam Tickers ── */}
         {upcomingExams.length > 1 && (
            <div className="flex flex-wrap gap-3 md:gap-4 animate-in slide-in-from-left-4 duration-500">
               {upcomingExams.slice(1).map((exam: any) => (
                  <Link key={exam._id} to="/exams" className="flex-1 min-w-[140px] bg-card/40 backdrop-blur-md border border-primary/5 rounded-2xl px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 hover:border-primary/20 transition-all group">
                     <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                        <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                     </div>
                     <div>
                        <p className="text-[8px] md:text-[9px] font-black uppercase opacity-40 leading-none mb-1">{exam.title}</p>
                        <p className="text-xs md:text-sm font-black leading-none">{exam.daysLeft} <span className="text-[8px] opacity-40">DAYS</span></p>
                     </div>
                  </Link>
               ))}
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

            {/* ── Main Feed ────────────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">

               {/* Velocity Chart Section */}
               {scoreTrend.length > 0 && (
                  <section className="bg-card/50 backdrop-blur-sm border border-primary/10 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-sm">
                     <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="font-heading text-lg md:text-xl font-black flex items-center gap-3">
                           <Zap className="h-5 w-5 text-primary" /> Quiz Velocity
                        </h3>
                        <Link to="/quizzes" className="text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">See Archive</Link>
                     </div>
                     <div className="h-[140px] md:h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={scoreTrend}>
                              <defs>
                                 <linearGradient id="scoreGradDashboard" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="8 8" stroke="hsl(var(--primary) / 0.05)" vertical={false} />
                              <XAxis dataKey="title" hide={true} />
                              <YAxis hide={true} domain={[0, 100]} />
                              <Tooltip
                                 cursor={{ fill: 'hsl(var(--primary) / 0.03)', radius: 10 } as any}
                                 contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                              />
                              <Bar dataKey="pct" radius={[8, 8, 8, 8]} fill="url(#scoreGradDashboard)" barSize={34} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </section>
               )}

               <section className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between px-2 md:px-0">
                     <h3 className="font-heading text-xl md:text-2xl font-black flex items-center gap-3">
                        <BrainCircuit className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Daily Directive
                     </h3>
                     <Link to="/planner" className="flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        Full Protocol <ChevronRight className="h-4 w-4" />
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                     {/* DPP Card */}
                     <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 cursor-pointer relative overflow-hidden group ${dppToday?.status === 'COMPLETED' ? 'bg-success/5 border-success/20' : 'bg-card/50 border-primary/5 hover:border-primary/20'
                        }`}
                        onClick={handleToggleDPP}
                     >
                        <div className="flex justify-between items-start relative z-10">
                           <div className="p-2.5 md:p-3.5 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                              <Target className="h-5 w-5 md:h-6 md:w-6" />
                           </div>
                           {dppToday?.status === 'COMPLETED' ? (
                              <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase tracking-widest rounded-full">Completed</span>
                           ) : (
                              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">DPP</span>
                           )}
                        </div>
                        <div className="mt-6 md:mt-8 space-y-1 md:space-y-2 relative z-10">
                           <h4 className="font-heading text-lg md:text-xl font-black">Daily Practice Protocol</h4>
                           <p className="text-xs md:text-sm text-muted-foreground font-medium opacity-60">10 High-yield problems across current modules.</p>
                        </div>
                     </div>

                     {/* Weekend Quiz (if applicable) */}
                     {weekendQuiz && (
                        <Link to="/quizzes" className={`p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border transition-all duration-500 relative overflow-hidden group ${weekendQuiz.status === 'COMPLETED' ? 'bg-success/5 border-success/20' : 'bg-accent/5 border-accent/20 hover:border-accent/40'
                           }`}>
                           <div className="flex justify-between items-start relative z-10">
                              <div className="p-2.5 md:p-3.5 rounded-2xl bg-accent/5 text-accent group-hover:scale-110 transition-transform">
                                 <Award className="h-5 w-5 md:h-6 md:w-6" />
                              </div>
                              <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full">Weekend Special</span>
                           </div>
                           <div className="mt-6 md:mt-8 space-y-1 md:space-y-2 relative z-10">
                              <h4 className="font-heading text-lg md:text-xl font-black">{weekendQuiz.dayName} Assessment</h4>
                              <p className="text-xs md:text-sm text-muted-foreground font-medium opacity-60">{weekendQuiz.quizzes.length} Quizzes logged for this cycle.</p>
                           </div>
                        </Link>
                     )}
                  </div>
               </section>

               {/* Active Revisions */}
               <section className="space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between px-2 md:px-0">
                     <h3 className="font-heading text-lg md:text-xl font-black flex items-center gap-3 text-accent">
                        <RefreshCw className="h-4 w-4 md:h-5 md:w-5" /> Repetition Feed
                     </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                     {revisionsToday.length === 0 ? (
                        <div className="p-8 md:p-10 text-center border border-dashed border-primary/10 rounded-[2rem] md:rounded-[2.5rem] bg-card/5">
                           <p className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-40">No revisions scheduled for this window.</p>
                        </div>
                     ) : (
                        revisionsToday.map((rev: any) => (
                           <div key={rev._id} className="bg-card/40 backdrop-blur-sm border border-primary/5 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-primary/15 transition-all text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-5 w-5" />
                                 </div>
                                 <div>
                                    <span className="text-[8px] md:text-[9px] font-black tracking-widest uppercase bg-primary/10 text-primary px-2 py-1 rounded-lg mb-2 inline-block">
                                       {rev.type} • R{rev.revisionNumber}
                                    </span>
                                    <h5 className="font-bold text-sm md:text-base leading-tight">
                                       {rev.tags?.[0]?.chapter?.name || "General Knowledge Sync"}
                                    </h5>
                                    <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/40 mt-1 uppercase truncate max-w-[200px]">{rev.tags?.[0]?.subject?.name}</p>
                                 </div>
                              </div>
                              <div className="w-full sm:w-auto">
                                 <Button
                                    size="sm"
                                    variant={rev.status === 'COMPLETED' ? 'default' : 'outline'}
                                    className={`w-full sm:w-auto rounded-xl font-black text-[10px] uppercase tracking-widest ${rev.status === 'COMPLETED' ? 'bg-success hover:bg-success/90 border-none' : ''}`}
                                    onClick={() => { handleRevisionAction(rev._id, rev.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'); }}
                                 >
                                    {rev.status === 'COMPLETED' ? 'Done' : 'Mark Done'}
                                 </Button>
                           </div>
                           </div>
                  ))
                     )}
            </div>
         </section>
      </div>

            {/* ── Sidebar: Progress & Velocity ──────────────────────────────── */ }
   <div className="lg:col-span-4 space-y-6 md:space-y-8">
      <section className="bg-card/50 backdrop-blur-md border border-primary/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-sm space-y-6 md:space-y-8 sticky top-10">
         <div className="flex items-center justify-between px-2">
            <h3 className="font-heading text-lg md:text-xl font-black">Subject Gravity</h3>
         </div>

         <div className="space-y-5 md:space-y-6">
            {subjectProgress.map((sub: any) => (
               <div key={sub._id} className="space-y-2 md:space-y-3 group">
                  <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest px-1">
                     <span className="text-muted-foreground group-hover:text-primary transition-colors">{sub.name}</span>
                     <span className="text-primary">{sub.percent}%</span>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-primary/5">
                     <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{
                           width: `${sub.percent}%`,
                           background: sub.color || 'hsl(var(--primary))',
                           boxShadow: `0 0 10px ${sub.color || 'hsl(var(--primary))'}40`
                        }}
                     />
                  </div>
               </div>
            ))}
         </div>

         <div className="pt-6 md:pt-8 border-t border-primary/5 space-y-4 md:space-y-6">
            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl">
               <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Daily Velocity</span>
               </div>
               <span className="font-mono text-xs md:text-sm font-black text-primary">+{topicsCompletedToday.length} Topics</span>
            </div>

            <Link to="/analytics">
               <Button className="w-full h-12 md:h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-xl hover:scale-[1.02] transition-all">
                  Neural Analytics
               </Button>
            </Link>
         </div>
      </section>
   </div>

         </div >
      </div >
   );
}
