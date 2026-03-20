import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, BookOpen, RefreshCw } from "lucide-react";
import { usePlanner } from "@/hooks/usePlanner";
import { Button } from "@/components/ui/button";

export default function Planner() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  
  const { logs, revisions, isLoading } = usePlanner(currentMonth);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0. standard getDay() is 0 for Sunday
  const firstDayOfWeek = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const todayStr = new Date().toISOString().split('T')[0];

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const getDateStr = (day: number) => {
    const d = new Date(year, month, day, 12);
    return d.toISOString().split('T')[0];
  };

  const dayData = useMemo(() => {
    const map: Record<string, any> = {};
    logs.forEach((log: any) => {
      const d = log.date.split('T')[0];
      if (!map[d]) map[d] = { topics: [], revisions: [], markers: new Set() };
      log.entries?.forEach((e: any) => {
        if (e.topic) {
          map[d].topics.push(e.topic);
          if (e.topic.subject) map[d].markers.add(e.topic.subject.color);
        }
      });
    });
    revisions.forEach((rev: any) => {
      const d = rev.scheduledDate.split('T')[0];
      if (!map[d]) map[d] = { topics: [], revisions: [], markers: new Set() };
      map[d].revisions.push(rev);
      if (rev.topic?.subject) map[d].markers.add(rev.topic.subject.color);
    });
    return map;
  }, [logs, revisions]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectedDayInfo = selectedDate ? dayData[selectedDate] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Daily Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">Calendar view of your study schedule</p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/30 p-1.5 rounded-2xl border border-primary/5">
           <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date())} className="h-9 w-9 text-xs font-bold rounded-xl hidden sm:flex">Today</Button>
           <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl"><ChevronLeft className="h-5 w-5" /></Button>
           <h2 className="font-heading font-bold px-4 text-sm w-36 text-center">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
           <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar grid */}
        <div className="lg:col-span-7 bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 gap-2">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <div key={d} className="text-center text-[10px] font-black text-muted-foreground/50 py-4 tracking-widest">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="aspect-square opacity-0" />;
              const dateStr = getDateStr(day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const info = dayData[dateStr];

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl text-sm transition-all duration-300 cursor-pointer group border ${
                    isSelected ? 
                      'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 transform scale-105 z-10' :
                      isToday ? 
                        'bg-primary/10 text-primary border-primary/30' : 
                        'bg-background/40 hover:bg-background border-transparent hover:border-primary/10'
                  }`}
                >
                  <span className={`font-mono text-base font-bold ${isToday && !isSelected ? 'text-primary' : ''}`}>{day}</span>
                  {info?.markers.size > 0 && (
                    <div className="absolute bottom-2.5 flex justify-center gap-1 w-full px-1">
                      {Array.from(info.markers).slice(0, 4).map((c: any, idx) => (
                        <div key={idx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : ''}`} style={{ background: isSelected ? undefined : c }} />
                      ))}
                    </div>
                  )}
                  {info?.topics.length > 0 && !isSelected && (
                     <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
          {isLoading && (
            <div className="flex justify-center pt-6">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Selected day content */}
        <div className="lg:col-span-5 bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-8 shadow-sm h-full min-h-[400px]">
          {selectedDate ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 border-b border-primary/5 pb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   <CalendarIcon className="h-7 w-7" />
                </div>
                <div>
                   <h3 className="font-heading text-xl font-bold text-foreground">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                  </h3>
                  <p className="text-sm font-bold text-muted-foreground opacity-70">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {selectedDayInfo ? (
                <div className="space-y-8">
                  {selectedDayInfo.topics.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                        <BookOpen className="h-3 w-3" /> New Topics Learned
                      </h4>
                      <div className="space-y-3">
                        {selectedDayInfo.topics.map((t: any) => (
                          <div key={t.id} className="group relative flex items-center gap-4 bg-background/50 border border-primary/5 rounded-2xl p-4 transition-all hover:border-primary/20">
                            <div className="w-2 h-8 rounded-full" style={{ background: t.subject?.color }} />
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-foreground truncate leading-tight">{t.name}</p>
                               <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-wider">{t.subject?.name}</span>
                            </div>
                            <span className="absolute top-2 right-4 text-xl opacity-20 transition-opacity group-hover:opacity-100">{t.subject?.icon}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDayInfo.revisions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent/60">
                         <RefreshCw className="h-3 w-3" /> Scheduled Revisions
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedDayInfo.revisions.map((r: any) => (
                           <div key={r.id} className="flex items-center gap-4 bg-background/50 border border-accent/10 rounded-2xl p-4 hover:border-accent/30 transition-all">
                              <div className="flex flex-col items-center justify-center bg-accent/10 text-accent font-mono text-xs font-black w-10 h-10 rounded-xl">
                                R{r.revisionNumber}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold text-foreground truncate leading-tight">{r.topic?.name}</p>
                                 <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase">{r.topic?.subject?.name}</span>
                                   <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'DONE' ? 'bg-success' : 'bg-warning'}`} />
                                   <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase">{r.status}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDayInfo.topics.length === 0 && selectedDayInfo.revisions.length === 0 && (
                    <EmptyDayMessage />
                  )}
                </div>
              ) : (
                <EmptyDayMessage />
              )}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                <CalendarIcon className="h-16 w-16" />
                <p className="font-bold text-sm uppercase tracking-widest">Select a day to view details</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyDayMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center text-4xl">🌤️</div>
      <div>
        <p className="font-bold text-foreground">Peaceful Day</p>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider opacity-60">Nothing scheduled for today</p>
      </div>
    </div>
  );
}
