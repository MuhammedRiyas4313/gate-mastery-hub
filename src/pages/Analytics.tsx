import { useAnalytics } from "@/hooks/useAnalytics";
import { ProgressRing } from "@/components/ProgressRing";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area } from "recharts";
import { Loader2, TrendingUp, Target, Award, Infinity, Zap } from "lucide-react";

export default function Analytics() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { readinessScore, subjectProgress, revisionBySlot, pyqByDifficulty, activityHeatmap } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold tracking-tighter">Insights & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">Data-driven optimization for your GATE preparation</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-primary/10 px-6 py-4 rounded-[2rem] border border-primary/20 shadow-lg shadow-primary/5">
           <Zap className="h-6 w-6 text-primary animate-pulse" />
           <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Live Learning Pulse</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Readiness Card */}
        <div className="lg:col-span-3 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground rounded-[2.5rem] p-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Award className="h-48 w-48" />
           </div>
           <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="p-4 bg-white/15 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                 <ProgressRing percent={readinessScore} size={140} strokeWidth={12} color="white" label="Ready" />
              </div>
              <div className="text-center md:text-left space-y-4">
                 <h2 className="font-heading text-3xl font-black">Overall GATE Readiness</h2>
                 <p className="text-primary-foreground/70 max-w-sm font-medium leading-relaxed">Your score is calculated based on lecture completion, revision consistency, and problem-solving accuracy.</p>
                 <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    <div className="bg-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                       <span className="text-2xl font-black">{readinessScore}%</span>
                       <span className="text-[10px] font-bold uppercase opacity-60">Percentile Range</span>
                    </div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl flex flex-col items-center">
                       <span className="text-2xl font-black">Rank A+</span>
                       <span className="text-[10px] font-bold uppercase opacity-60">Status</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Quick Insights Slider or Stats */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-8 flex flex-col justify-between">
           <div className="space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground/60">Key Performance</h3>
              {[
                { label: 'Consistency', val: 'Elite', icon: <TrendingUp className="h-4 w-4" /> },
                { label: 'Accuracy', val: '88%', icon: <Target className="h-4 w-4" /> },
                { label: 'Potential', val: 'Top 100', icon: <Award className="h-4 w-4" /> },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-4">
                   <div className="p-2.5 rounded-xl bg-secondary text-primary font-bold">
                      {stat.icon}
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                      <p className="text-lg font-black text-foreground leading-tight">{stat.val}</p>
                   </div>
                </div>
              ))}
           </div>
           <Button className="w-full h-12 rounded-[1.25rem] mt-8 bg-foreground text-background hover:bg-foreground/80 font-bold tracking-tighter shadow-lg">Download Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject progress */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-10 shadow-sm space-y-8">
           <h3 className="font-heading text-xl font-bold flex items-center gap-3">
              <span className="text-2xl">📊</span> Mastery by Domain
           </h3>
           <div className="space-y-6">
            {subjectProgress.map((sub: any) => (
              <div key={sub.subject.id} className="space-y-3 group">
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{sub.subject.icon}</div>
                      <span className="font-bold text-sm">{sub.subject.name}</span>
                   </div>
                   <span className="font-mono text-xs font-black text-primary">{Math.round(sub.progressPercent)}%</span>
                </div>
                <div className="w-full h-2.5 bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-primary/5">
                   <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${sub.progressPercent}%`, background: sub.subject.color, boxShadow: `0 0 15px ${sub.subject.color}40` }} />
                </div>
              </div>
            ))}
           </div>
        </div>

        {/* Revision completion by slot */}
        <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-10 shadow-sm space-y-8">
           <h3 className="font-heading text-xl font-bold flex items-center gap-3 text-accent">
              <span className="text-2xl">🧠</span> Spaced Repetition Efficiency
           </h3>
           <div className="h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={revisionBySlot}>
                 <CartesianGrid strokeDasharray="6 6" stroke="hsl(var(--primary) / 0.05)" vertical={false} />
                 <XAxis dataKey="slot" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} />
                 <Tooltip cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 10 }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary) / 0.1)', borderRadius: '16px', fontWeight: 700 }} />
                 <Bar dataKey="done" radius={[6, 6, 0, 0]} name="Mastered" barSize={32}>
                    {revisionBySlot.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={1 - (index * 0.15)} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="animate-in slide-up duration-700">
         <ActivityHeatmap data={activityHeatmap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* PYQ Analytics */}
         <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-10 shadow-sm space-y-8">
            <h3 className="font-heading text-xl font-bold flex items-center gap-3 text-orange-500">
               <span className="text-2xl">🏺</span> PYQ Depth Analysis
            </h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pyqByDifficulty}>
                     <defs>
                        <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                           <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--primary) / 0.03)" vertical={false} />
                     <XAxis dataKey="difficulty" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', background: 'hsl(var(--card))', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} />
                     <Area type="monotone" dataKey="done" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorDone)" name="Solved" />
                     <Area type="monotone" dataKey="total" stroke="hsl(var(--secondary))" strokeWidth={2} strikeDasharray="5 5" fill="transparent" name="Goal" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Motivational Insight */}
         <div className="relative overflow-hidden bg-card/40 border border-primary/5 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center space-y-6">
            <div className="absolute top-0 left-0 p-8 opacity-10">
               <Infinity className="h-64 w-64" />
            </div>
            <Award className="h-16 w-16 text-primary" />
            <div className="max-w-xs relative z-10">
               <h3 className="font-heading text-2xl font-black italic">"Precision beats power, and timing beats speed."</h3>
               <p className="text-sm font-bold text-muted-foreground mt-4 opacity-70">— Your GATE Readiness: Elite</p>
            </div>
            <div className="pt-6">
               <div className="inline-flex items-center gap-2 px-6 py-2 bg-success/10 text-success rounded-full text-xs font-black uppercase tracking-widest border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                  Performance Stabilized
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
