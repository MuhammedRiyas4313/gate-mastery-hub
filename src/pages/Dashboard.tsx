import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import {
   Flame,
   BookOpen,
   RefreshCw,
   LayoutDashboard,
   Target,
   CalendarDays,
   ChevronRight,
   TrendingUp,
   Zap,
   Trophy,
   AlertCircle,
   ArrowUpRight,
   Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";

export default function Dashboard() {
   const { user: authUser } = useAuth();
   const {
      data: dashboard,
      isLoading,
      error
   } = useDashboard();

   const {
      topicsCompletedToday = [],
      gateCountdownDays,
      upcomingExams = [],
      subjectProgress = [],
      streak = 0,
      pendingSummary = { totalPending: 0, dppsCount: 0, revisionsCount: 0, pyqsCount: 0, testsCount: 0, quizzesCount: 0 },
      activityHeatmap = []
   } = dashboard || {};

   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
               <div className="relative">
                  <div className="h-10 w-10 rounded-full border-t-2 border-primary animate-spin" />
                  <LayoutDashboard className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Hub...</p>
            </div>
         </div>
      );
   }

   if (error || !dashboard) {
      return (
         <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
            <div className="max-w-xs space-y-4">
               <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
               <h2 className="text-xl font-black font-heading tracking-tight text-foreground">Signal Lost</h2>
               <p className="text-xs text-muted-foreground">Unable to connect to the central node.</p>
            </div>
         </div>
      );
   }

   const primaryExam = upcomingExams[0];

   return (
      <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-2 duration-500">

         <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-primary/5">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Activity className="h-6 w-6 text-primary animate-pulse" />
               </div>
               <div>
                  <h1 className="font-heading text-xl font-black tracking-tight text-foreground">
                     Hello, <span className="text-primary italic">{dashboard?.user?.name || authUser?.name || 'Commander'}</span>
                  </h1>
                  <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                     <CalendarDays className="h-3 w-3 text-primary/60" /> {format(new Date(), "eeee, do MMMM")}
                     <span className="h-1 w-1 rounded-full bg-border mx-1" />
                     <span className="text-success uppercase tracking-widest font-black">Active Protocol</span>
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <div className="flex items-center gap-3 bg-card border border-primary/10 pl-4 pr-1 py-1 rounded-full">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Streak</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                     <span className="text-sm font-black">{streak}</span>
                     <Flame className="h-3.5 w-3.5" />
                  </div>
               </div>
               {primaryExam && (
                  <Link to="/exams" className="flex items-center gap-3 bg-card border border-primary/10 pl-4 pr-1 py-1 rounded-full hover:border-primary/30 transition-all">
                     <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter truncate max-w-[80px]">{primaryExam.title}</span>
                     <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground text-background">
                        <span className="text-sm font-black">{gateCountdownDays || 0}</span>
                        <Target className="h-3.5 w-3.5" />
                     </div>
                  </Link>
               )}
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Main Panel ── */}
            <div className="lg:col-span-8 space-y-6">

               <div>
                  <h3 className="font-heading text-[10px] font-black flex items-center gap-3 uppercase italic text-foreground mb-4">
                     <Zap className="h-4 w-4 text-primary" /> Pending Missions
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {/* DPP */}
                     <Link to="/dpp" className="group flex items-center justify-between p-3.5 bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl transition-all hover:bg-card hover:border-primary/30">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                              <Target className="h-4 w-4" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">DPP</h4>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${pendingSummary.dppsCount > 0 ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success'}`}>
                                    {pendingSummary.dppsCount} PENDING
                                 </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground opacity-60 mt-0.5">
                                 {pendingSummary.dppsCount > 0 ? "Daily Practice Protocol pending" : "No active drills for today"}
                              </p>
                           </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-40" />
                     </Link>

                     {/* Revision */}
                     <Link to="/revision" className="group flex items-center justify-between p-3.5 bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl transition-all hover:bg-card hover:border-accent/30">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center transition-transform group-hover:scale-110">
                              <RefreshCw className="h-4 w-4" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">REVISION</h4>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${pendingSummary.revisionsCount > 0 ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'}`}>
                                    {pendingSummary.revisionsCount} PENDING
                                 </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground opacity-60 mt-0.5">
                                 {pendingSummary.revisionsCount > 0 ? `Intelligence retention: ${pendingSummary.revisionsCount} units` : "System optimization complete"}
                              </p>
                           </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-40" />
                     </Link>

                     {/* PYQ */}
                     <Link to="/pyq" className="group flex items-center justify-between p-3.5 bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl transition-all hover:bg-card hover:border-success/30">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-xl bg-success/10 text-success flex items-center justify-center transition-transform group-hover:scale-110">
                              <BookOpen className="h-4 w-4" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">PYQ</h4>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${pendingSummary.pyqsCount > 0 ? 'bg-success/20 text-success' : 'bg-success/20 text-success'}`}>
                                    {pendingSummary.pyqsCount} PENDING
                                 </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground opacity-60 mt-0.5">
                                 {pendingSummary.pyqsCount > 0 ? "Historical datasets unresolved" : "All simulations neutralized"}
                              </p>
                           </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-40" />
                     </Link>

                     {/* Test Series */}
                     <Link to="/test-series" className="group flex items-center justify-between p-3.5 bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl transition-all hover:bg-card hover:border-warning/30">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center transition-transform group-hover:scale-110">
                              <Trophy className="h-4 w-4" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">TEST SERIES</h4>
                                 <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${pendingSummary.testsCount > 0 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                                    {pendingSummary.testsCount} PENDING
                                 </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground opacity-60 mt-0.5">
                                 {pendingSummary.testsCount > 0 ? "Battlefield readiness simulation active" : "Target success confirmed"}
                              </p>
                           </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground opacity-40" />
                     </Link>

                     {/* Quiz Sessions */}
                     <Link to="/quizzes" className="group flex items-center justify-between p-3.5 bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl transition-all hover:bg-card hover:border-primary/30 col-span-1 sm:col-span-2">
                        <div className="flex items-center gap-3 font-semibold">
                           <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                              <LayoutDashboard className="h-4 w-4" />
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center justify-between w-full pr-4">
                                 <div className="flex items-center gap-3">
                                    <h4 className="text-[12px] font-black text-foreground uppercase tracking-tight">QUIZ SESSIONS</h4>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${pendingSummary.quizzesCount > 0 ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success'}`}>
                                       {pendingSummary.quizzesCount} PENDING
                                    </span>
                                 </div>
                                 <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40" />
                              </div>
                              <p className="text-[9px] text-muted-foreground opacity-60 mt-0.5">Auto-Generated Weekend Drills & Mock Evaluations</p>
                           </div>
                        </div>
                     </Link>
                  </div>
               </div>

               <div className="animate-in slide-in-from-bottom-4 duration-700">
                  <ActivityHeatmap data={activityHeatmap} />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-card/20 border border-white/5 rounded-2xl space-y-1">
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Neural Velocity</span>
                     <div className="flex items-center justify-between">
                        <span className="text-base font-black italic text-foreground">+{topicsCompletedToday.length} Topics</span>
                        <TrendingUp className="h-4 w-4 text-primary" />
                     </div>
                  </div>
               </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="lg:col-span-4 space-y-6">
               <div className="space-y-4">
                  <h3 className="font-heading text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 text-foreground">
                     <div className="h-0.5 w-4 bg-primary rounded-full" /> Intelligence Hierarchy
                  </h3>

                  <div className="space-y-2">
                     {subjectProgress.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-white/5 rounded-2xl opacity-30">
                           <p className="text-[9px] font-black uppercase">Scanning nodes...</p>
                        </div>
                     ) : (
                        subjectProgress.map((sub: any) => (
                           <div key={sub._id} className="group relative bg-card/30 border border-white/5 rounded-xl p-3 transition-all hover:bg-card/50">
                              <div className="flex items-center gap-3">
                                 <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs shadow-sm border border-white/5" style={{ background: `${sub.color}20` }}>
                                    {sub.icon || '📚'}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-end mb-1 px-0.5">
                                       <h5 className="font-bold text-[10px] truncate uppercase tracking-tighter text-foreground">{sub.name}</h5>
                                       <span className="text-[8px] font-black text-primary">{sub.percent}%</span>
                                    </div>
                                    <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                       <div
                                          className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 ease-out"
                                          style={{
                                             width: `${sub.percent}%`,
                                             background: sub.color || 'var(--primary)'
                                          }}
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>

               {upcomingExams.length > 1 && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic px-1">Thresholds</span>
                     <div className="space-y-2">
                        {upcomingExams.slice(1).map((exam: any) => (
                           <Link key={exam._id} to="/exams" className="flex items-center justify-between p-3 bg-white/2 rounded-xl border border-white/5 transition-colors hover:bg-white/5 group">
                              <div className="flex items-center gap-2.5">
                                 <Trophy className="h-3.5 w-3.5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                 <span className="text-[10px] font-bold uppercase truncate max-w-[100px] text-foreground">{exam.title}</span>
                              </div>
                              <span className="text-[9px] font-black text-muted-foreground">{exam.daysLeft}d</span>
                           </Link>
                        ))}
                     </div>
                  </div>
               )}
            </aside>
         </div>
      </div>
   );
}
