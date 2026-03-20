import { useDashboard } from "@/hooks/useDashboard";
import { useMemo } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import { CheckCircle2, Circle, Clock, Flame, BookOpen, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { 
    data: dashboard, 
    isLoading, 
    error,
    toggleLecture,
    updateDPP,
    updateRevision
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-destructive">Error loading dashboard</h2>
        <p className="text-muted-foreground mt-2">Make sure your backend is running at http://localhost:4000</p>
      </div>
    );
  }

  const { todayTopics, todayDPP, revisionsToday, studyStreak, gateCountdownDays, subjectProgress } = dashboard;

  // Week strip (mocked locally for UI but uses current date)
  const weekDays = (() => {
    const days = [];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        num: d.getDate(),
        isToday,
        hasDone: false, // Could be derived from analytics if needed
        hasPending: true,
      });
    }
    return days;
  })();

  const handleToggleLecture = (topic: any) => {
    const newStatus = topic.lecture?.status === 'DONE' ? 'PENDING' : 'DONE';
    toggleLecture.mutate({ topicId: topic.id, status: newStatus });
  };

  const handleToggleDPP = () => {
    if (!todayDPP) return;
    const newStatus = todayDPP.status === 'DONE' ? 'PENDING' : 'DONE';
    updateDPP.mutate({ id: todayDPP.id, status: newStatus });
  };

  const handleRevisionAction = (id: string, status: 'DONE' | 'SNOOZED') => {
    updateRevision.mutate({ id, status });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Today's Focus</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay on track. One topic at a time.</p>
        </div>
        <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-primary/10 px-5 py-3 rounded-2xl shadow-sm">
          <Flame className="h-6 w-6 text-primary animate-pulse" />
          <div>
            <span className="block font-mono font-bold text-2xl leading-none text-foreground">{studyStreak || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">day streak</span>
          </div>
        </div>
      </div>

      {/* Week strip */}
      <div className="flex gap-2">
        {weekDays.map((d) => (
          <div
            key={d.date}
            className={`flex-1 flex flex-col items-center py-3.5 rounded-2xl text-xs transition-all duration-300 transform hover:scale-105 border ${
              d.isToday 
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                : 'bg-card/50 text-muted-foreground border-primary/5 hover:border-primary/20 hover:bg-card'
            }`}
          >
            <span className="font-semibold opacity-80 uppercase tracking-tighter">{d.day}</span>
            <span className={`font-mono text-xl font-bold mt-1 ${d.isToday ? 'text-white' : 'text-foreground'}`}>{d.num}</span>
            <div className="flex gap-1 mt-2">
              {d.hasDone && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
              {d.hasPending && <div className={`w-1.5 h-1.5 rounded-full ${d.isToday ? 'bg-white' : 'bg-warning'}`} />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Topics */}
          <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading text-lg font-bold mb-5 flex items-center gap-3 text-foreground">
              <div className="p-2 rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              New Topics Taught
              <span className="ml-auto text-xs font-mono font-medium py-1 px-3 rounded-full bg-secondary text-secondary-foreground">
                {todayTopics.filter((t: any) => t.lecture?.status === 'DONE').length}/{todayTopics.length}
              </span>
            </h3>
            {todayTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">All Clear!</p>
                  <p className="text-xs text-muted-foreground">No new topics scheduled for today.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTopics.map((topic: any) => (
                  <div
                    key={topic.id}
                    className={`group flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer bg-background/40 border border-primary/5 hover:border-primary/20 hover:bg-background transition-all duration-300 ${topic.lecture?.status === 'DONE' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    onClick={() => handleToggleLecture(topic)}
                  >
                    <div className="transition-transform group-hover:scale-110">
                      {topic.lecture?.status === 'DONE' ? (
                        <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground/30 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md">Lecture</span>
                        <span className="text-xs text-muted-foreground truncate opacity-70 italic">{topic.chapter?.name}</span>
                      </div>
                      <p className={`text-sm font-bold truncate ${topic.lecture?.status === 'DONE' ? 'line-through text-muted-foreground font-medium' : 'text-foreground'}`}>
                        {topic.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's DPP */}
          {todayDPP && (
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card border border-primary/10 rounded-3xl p-6 shadow-md group">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12 translate-x-4 -translate-y-4">
                 <BookOpen className="h-32 w-32" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-3">
                <span className="text-2xl">📋</span> Daily Practice Paper
              </h3>
              <div className="flex items-end justify-between relative z-10">
                <div className="space-y-3">
                   <p className="text-sm text-muted-foreground font-medium max-w-[200px]">Test your understanding of today's topics with targeted practice.</p>
                   <div className="flex flex-wrap gap-1.5">
                    {todayDPP.tags.map((tag: any, i: number) => {
                      const s = tag.subject;
                      return s ? (
                        <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-primary/10" style={{ background: s.color + '15', color: s.color }}>
                          {s.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <Button
                  size="lg"
                  variant={todayDPP.status === 'DONE' ? 'secondary' : 'default'}
                  className={`h-12 px-8 rounded-2xl font-bold transition-all shadow-lg ${todayDPP.status === 'DONE' ? 'bg-success/10 text-success border-success/20 hover:bg-success/20' : 'shadow-primary/20'}`}
                  onClick={handleToggleDPP}
                  disabled={updateDPP.isPending}
                >
                  {updateDPP.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {todayDPP.status === 'DONE' ? '✓ Completed' : 'Start Solving'}
                </Button>
              </div>
            </div>
          )}

          {/* Revisions due today */}
          {revisionsToday.length > 0 && (
            <div className="bg-card/50 backdrop-blur-sm border border-accent/10 rounded-3xl p-6 shadow-sm">
              <h3 className="font-heading text-lg font-bold mb-6 flex items-center gap-3 text-accent">
                <div className="p-2 rounded-xl bg-accent/10">
                  <RefreshCw className="h-5 w-5" />
                </div>
                Review & Optimize ({revisionsToday.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {revisionsToday.map((rev: any) => (
                  <div key={rev.id} className="flex flex-col justify-between bg-background/60 border border-accent/5 rounded-2xl p-4 hover:border-accent/30 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-accent/10 text-accent px-2.5 py-1 rounded-md mb-2 inline-block">R{rev.revisionNumber}</span>
                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">{rev.topic?.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-1 opacity-70 uppercase truncate">{rev.topic?.chapter?.name}</p>
                      </div>
                      <span className="text-2xl p-2 rounded-xl bg-accent/5">
                        {rev.topic?.subject?.icon || '📚'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                       <Button size="sm" variant="ghost" className="flex-1 h-9 rounded-xl text-xs font-semibold hover:bg-accent/10 text-muted-foreground hover:text-accent" onClick={() => handleRevisionAction(rev.id, 'SNOOZED')}>Snooze</Button>
                       <Button size="sm" className="flex-1 h-9 rounded-xl text-xs font-bold bg-accent hover:bg-accent/80 text-white shadow-sm" onClick={() => handleRevisionAction(rev.id, 'DONE')}>Review Done</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl shadow-primary/20 group">
             <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
             <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-[0.2em]">GATE Countdown</p>
             <div className="flex items-baseline gap-2 mt-4">
               <p className="font-mono text-6xl font-black tracking-tighter">{gateCountdownDays || 0}</p>
               <p className="text-sm font-bold text-primary-foreground/60 uppercase">Days</p>
             </div>
             <div className="mt-6 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
               <div className="bg-white h-full w-2/3" />
             </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold mb-6">Mastery Level</h3>
            <div className="space-y-6">
              {subjectProgress.map((stat: any) => (
                <div key={stat.subject.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-2">
                      <span className="text-lg">{stat.subject.icon}</span> {stat.subject.name}
                    </span>
                    <span className="font-mono text-muted-foreground font-bold">{Math.round(stat.progressPercent)}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden p-0.5 border border-primary/5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                      style={{ 
                        width: `${stat.progressPercent}%`, 
                        backgroundColor: stat.subject.color,
                        boxShadow: `0 0 15px ${stat.subject.color}40`
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-3xl p-6 space-y-5">
            <h3 className="font-heading text-base font-bold">Session Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Topics', value: dashboard.todayTopics.length + dashboard.revisionsToday.length, color: 'text-foreground', icon: '🎯' },
                { label: 'Completed', value: dashboard.todayTopics.filter((t: any) => t.lecture?.status === 'DONE').length, color: 'text-success', icon: '✅' },
              ].map((stat) => (
                <div key={stat.label} className="bg-background/40 border border-primary/5 rounded-2xl p-4 text-center group hover:border-primary/20 transition-all">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <p className={`font-mono text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
