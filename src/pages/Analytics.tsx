import { useAnalytics } from "@/hooks/useAnalytics";
import { ProgressRing } from "@/components/ProgressRing";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area } from "recharts";
import { Loader2, TrendingUp, Target, Award, Infinity as InfinityIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="h-12 w-12 text-primary animate-spin" />
           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing Trajectory...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <Target className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Analytics Offline</h2>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Unable to synchronize with the performance data engine.</p>
      </div>
    );
  }

  const { readinessScore, subjectProgress, revisionBySlot, pyqByDifficulty, activityHeatmap, streak = 0 } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-primary/5 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-0.5 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Neural Engine</span>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
           </div>
           <h1 className="font-heading text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">Insights & Strategy</h1>
           <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-sm mx-auto md:mx-0 leading-relaxed">Data-driven performance optimization for target goals</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex items-center gap-4 bg-primary/5 px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl border border-primary/10 flex-1 md:flex-none">
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse shrink-0" />
              <div className="text-left">
                 <p className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground opacity-60 leading-none mb-1">Performance Pulse</p>
                 <p className="text-lg md:text-xl font-black text-primary leading-none uppercase">Stabilized</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Readiness Card */}
        <div className="lg:col-span-8 bg-primary text-primary-foreground rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Award className="h-48 w-36 md:h-64 md:w-48" />
           </div>
           <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
              <div className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl shrink-0">
                 <ProgressRing percent={readinessScore} size={160} strokeWidth={14} color="#ffffff" label="Ready" />
              </div>
              <div className="text-center md:text-left space-y-3 md:space-y-4">
                 <h2 className="font-heading text-2xl md:text-3xl font-black tracking-tight leading-tight">Mastery Progression Index</h2>
                 <p className="text-primary-foreground/70 max-w-sm text-xs md:text-sm font-medium leading-relaxed">
                    Integrated readiness calculated across lecture density, revision efficiency, and problem accuracy.
                 </p>
                 <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-center md:justify-start pt-2">
                    <div className="bg-white/10 px-5 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/10 flex flex-col">
                       <span className="text-xl md:text-2xl font-black tracking-tighter">{readinessScore}%</span>
                       <span className="text-[8px] md:text-[9px] font-bold uppercase opacity-60 leading-none">Percentile</span>
                    </div>
                    <div className="bg-white/10 px-5 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/10 flex flex-col">
                       <span className="text-xl md:text-2xl font-black tracking-tighter">Elite</span>
                       <span className="text-[8px] md:text-[9px] font-bold uppercase opacity-60 leading-none">Benchmark</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Quick Intelligence Feed */}
        <div className="lg:col-span-4 bg-card/40 backdrop-blur-md border border-primary/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 space-y-6 md:space-y-8 shadow-sm">
           <h3 className="text-[10px] md:text-[11px] font-black uppercase text-muted-foreground tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Intelligence Feed
           </h3>
           <div className="space-y-5 md:space-y-6">
              {[
                { label: 'Consistency', val: streak > 0 ? `${streak} DAY STREAK` : 'Nominal', icon: <Zap className="h-4 w-4" /> },
                { label: 'Accuracy', val: '82%', icon: <Target className="h-4 w-4" /> },
                { label: 'Potential', val: 'AIR < 500', icon: <Award className="h-4 w-4" /> },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-4 md:gap-5 group">
                   <div className="p-3 md:p-3.5 rounded-xl md:rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110 shrink-0">
                      {stat.icon}
                   </div>
                   <div className="min-w-0">
                      <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 md:mb-1.5 truncate">{stat.label}</p>
                      <p className="text-lg md:text-xl font-black text-foreground leading-none">{stat.val}</p>
                   </div>
                </div>
              ))}
           </div>
           <Button className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-foreground/10 hover:scale-[1.02] transition-all">Extract performance vault</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subject Mastery Map */}
        <div className="lg:col-span-12 bg-card/30 backdrop-blur-md border border-primary/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm space-y-6 md:space-y-10">
           <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg md:text-xl font-black flex items-center gap-3">
                 <span className="p-2 md:p-2.5 rounded-xl bg-primary/10 text-primary"><TrendingUp className="w-4 h-4 md:w-5 md:h-5" /></span> Domain Mastery Matrix
              </h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {subjectProgress?.map((sub: any) => (
              <div key={sub.subject.id} className="space-y-4 group p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-background/40 border border-transparent hover:border-primary/10 hover:bg-background/80 transition-all duration-500 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center text-left">
                   <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/5 flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-all shadow-sm shrink-0">{sub.subject.icon || '📚'}</div>
                      <div className="min-w-0">
                         <span className="font-black text-xs md:text-sm block truncate leading-tight uppercase tracking-tight" title={sub.subject.name}>{sub.subject.name}</span>
                         <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase opacity-60 leading-none">{sub.doneTopics}/{sub.totalTopics} Units</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-1.5 md:space-y-2 pt-1 md:pt-2">
                   <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.1em]">Performance</span>
                      <span className="font-mono text-xs md:text-sm font-black text-primary">{Math.round(sub.progressPercent)}%</span>
                   </div>
                   <div className="w-full h-1.5 md:h-2 bg-secondary/30 rounded-full overflow-hidden p-0.5">
                      <div 
                         className="h-full rounded-full transition-all duration-[1.5s] ease-out-expo shadow-sm" 
                         style={{ 
                            width: `${sub.progressPercent}%`, 
                            background: sub.subject.color || 'hsl(var(--primary))',
                         }} 
                      />
                   </div>
                </div>
              </div>
            ))}
           </div>
        </div>

        {/* Efficiency Analytics */}
        <div className="lg:col-span-6 bg-card/60 backdrop-blur-md border border-primary/5 rounded-[3rem] p-10 shadow-sm space-y-8">
           <h3 className="font-heading text-xl font-black flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-accent/10 text-accent"><Target className="w-5 h-5" /></span> Spaced Repetition Load
           </h3>
           <div className="h-[300px] mt-6">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revisionBySlot}>
                 <defs>
                   <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                     <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="8 8" stroke="hsl(var(--primary) / 0.05)" vertical={false} />
                 <XAxis dataKey="slot" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} />
                 <Tooltip cursor={{ fill: 'hsl(var(--primary) / 0.03)', radius: 12 }} contentStyle={{ background: 'hsl(var(--card))', border: 'none', borderRadius: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', padding: '15px' }} />
                 <Bar dataKey="done" radius={[12, 12, 12, 12]} fill="url(#barGrad)" barSize={45}>
                    {revisionBySlot?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.1)} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* PYQ Performance Analysis */}
        <div className="lg:col-span-6 bg-card/60 backdrop-blur-md border border-primary/5 rounded-[3rem] p-10 shadow-sm space-y-8">
           <h3 className="font-heading text-xl font-black flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-warning/10 text-warning"><Award className="w-5 h-5" /></span> Problem Depth Index
           </h3>
           <div className="h-[300px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={pyqByDifficulty}>
                    <defs>
                       <linearGradient id="colorDoneAnalytics" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" stroke="hsl(var(--primary) / 0.03)" vertical={false} />
                    <XAxis dataKey="difficulty" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', background: 'hsl(var(--card))', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }} />
                    <Area type="monotone" dataKey="done" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorDoneAnalytics)" name="Solved" />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Inventory" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Activity Heatmap Section */}
      <div className="animate-in slide-in-from-bottom-10 duration-[1s]">
         <ActivityHeatmap data={activityHeatmap} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch pt-8 md:pt-12 border-t border-primary/5">
          <div className="bg-card/20 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col justify-center text-center space-y-5 md:space-y-6">
             <InfinityIcon className="h-10 w-10 md:h-12 md:w-12 text-primary/40 mx-auto" strokeWidth={1} />
             <div className="max-w-xs mx-auto">
                <h3 className="font-heading text-lg md:text-xl font-black tracking-tight leading-relaxed">"Precision beats power, and timing beats speed."</h3>
                <p className="text-[9px] md:text-[10px] font-black text-muted-foreground mt-3 md:mt-4 uppercase tracking-[0.2em] opacity-50">— Performance Logic</p>
             </div>
          </div>

          <div className="bg-primary/5 rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col items-center justify-center text-center">
             <div className="inline-flex items-center gap-3 px-5 py-2 md:px-6 md:py-2.5 bg-success/10 text-success rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-success/20 mb-5 md:mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                Pulse Stabilized
             </div>
             <p className="text-xs md:text-sm font-bold text-muted-foreground/80 leading-relaxed max-w-[280px]">Your learning trajectory is currently aligned with elite benchmarks. Maintain consistency.</p>
          </div>
      </div>

    </div>
  );
}
