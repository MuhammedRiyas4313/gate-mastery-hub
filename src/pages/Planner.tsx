import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  RefreshCw, 
  Target, 
  Plus, 
  MoreHorizontal,
  Loader2,
  Award,
  Zap
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import api from '../lib/rest-client';
import { Link } from 'react-router-dom';

const Planner: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(format(new Date(), 'yyyy-MM-dd'));
  const [plannerData, setPlannerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlannerData();
  }, [currentMonth]);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const response = await api.get(`/planner?start=${start}&end=${end}`);
      setPlannerData(response.data);
    } catch (error) {
      console.error('Error fetching planner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, -1));

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6 px-1 md:px-2">
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-black font-heading tracking-tight text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-50">Oracle Calendar</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-card border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all shadow-sm">
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        <button onClick={nextMonth} className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-card border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all shadow-sm">
          <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest opacity-40 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1 md:gap-3">
        {allDays.map((d, i) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const dayData = plannerData?.[dateStr];
          const isSelected = selectedDate === dateStr;
          const isCurrentMonth = isSameMonth(d, monthStart);
          const hasActivity = dayData && (dayData.topics.length > 0 || dayData.revisions.length > 0 || dayData.dpps.length > 0 || dayData.pyqs.length > 0);

          return (
            <div 
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`
                relative aspect-square rounded-xl md:rounded-2xl border transition-all cursor-pointer group flex flex-col p-1.5 md:p-2 min-h-[40px]
                ${!isCurrentMonth ? 'opacity-20 pointer-events-none' : 'opacity-100'}
                ${isSelected ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-[0.98]' : 'bg-card/50 border-primary/5 hover:border-primary/20 hover:bg-card'}
              `}
            >
              <span className={`text-[10px] md:text-xs font-black ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {format(d, 'd')}
              </span>

              {hasActivity && !isSelected && (
                <div className="mt-auto flex flex-wrap gap-0.5 md:gap-1">
                   {dayData.topics.length > 0 && <div className="h-1 w-1 rounded-full bg-primary" />}
                   {dayData.revisions.length > 0 && <div className="h-1 w-1 rounded-full bg-accent" />}
                   {(dayData.dpps.length > 0 || dayData.pyqs.length > 0) && <div className="h-1 w-1 rounded-full bg-destructive" />}
                </div>
              )}
              
              {isSelected && (
                <div className="absolute top-1 right-1 md:top-2 md:right-2 h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-white animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const selectedDayInfo = selectedDate ? plannerData?.[selectedDate] : null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
          
          {/* ── Main Event View (Tasks for that day) ──────────────────────── */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            <div className="bg-card/60 backdrop-blur-xl border border-primary/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm min-h-[300px] md:min-h-[500px]">
              {selectedDate ? (
                <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                  <div className="border-b border-primary/10 pb-6 md:pb-8 flex items-center justify-between">
                      <div className="space-y-1">
                         <h3 className="font-heading text-xl md:text-2xl font-black text-foreground">
                           {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                         </h3>
                         <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary opacity-70">
                           {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })} Expedition
                         </p>
                      </div>
                      <Link to="/subjects" className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary shadow-sm hover:text-white transition-all transform hover:rotate-12">
                         <Plus className="h-4 w-4 md:h-5 md:w-5" />
                      </Link>
                  </div>

                  {selectedDayInfo ? (
                    <div className="space-y-8 md:space-y-10">
                      
                      {/* Topics Learned */}
                      {selectedDayInfo.topics.length > 0 && (
                        <div className="space-y-3 md:space-y-4">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                             <BookOpen className="w-3 h-3 text-primary" /> Lectures Consumed
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            {selectedDayInfo.topics.map((t: any) => (
                              <div key={t._id} className="group flex items-center gap-3 md:gap-4 bg-background/50 border border-primary/5 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 hover:border-primary/20 transition-all">
                                 <div className="w-1 h-6 md:w-1.5 md:h-8 rounded-full bg-primary/20 transition-all group-hover:h-8 md:group-hover:h-10 group-hover:bg-primary" />
                                 <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm font-black text-foreground leading-tight truncate">{t.name}</p>
                                    <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground opacity-60 uppercase mt-0.5 md:mt-1 truncate">{t.subject?.name}</p>
                                 </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Revisions */}
                      {selectedDayInfo.revisions.length > 0 && (
                        <div className="space-y-3 md:space-y-4">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                             <RefreshCw className="w-3 h-3 text-accent" /> Active Revisions
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            {selectedDayInfo.revisions.map((r: any) => (
                              <Link key={r._id} to="/revision" className="flex items-center gap-3 md:gap-4 bg-accent/5 border border-accent/10 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 hover:bg-accent/10 hover:border-accent/30 transition-all group">
                                 <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-accent text-accent-foreground font-mono text-[10px] md:text-xs font-black flex items-center justify-center shadow-lg shadow-accent/10 group-hover:scale-110 transition-transform">R{r.revisionNumber}</div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-xs md:text-sm font-black text-foreground truncate leading-tight">
                                       {r.tags?.[0]?.topic?.name || r.tags?.[0]?.chapter?.name || r.title || 'General Review'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <div className={`h-1.5 w-1.5 rounded-full ${r.status === 'DONE' ? 'bg-success' : 'bg-warning'}`} />
                                       <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider font-mono">
                                          {r.tags?.[0]?.subject?.name && `${r.tags[0].subject.name} • `}{r.status}
                                       </span>
                                    </div>
                                 </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mixed Feed */}
                      {(selectedDayInfo.dpps.length > 0 || selectedDayInfo.pyqs.length > 0 || selectedDayInfo.tests.length > 0 || selectedDayInfo.quizzes.length > 0) && (
                         <div className="space-y-3 md:space-y-4">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                               <Target className="w-3 h-3 text-destructive" /> Assessment Vault
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                               {selectedDayInfo.dpps.map((d: any) => (
                                 <Link key={d._id} to="/dpp" className="flex items-center gap-3 md:gap-4 bg-background/50 border border-primary/5 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 transition-all hover:border-primary/20">
                                    <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg md:rounded-xl font-black text-[10px] md:text-xs">D</div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-xs md:text-sm font-black text-foreground">Practice Paper Pack</p>
                                       <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${d.status === 'COMPLETED' ? 'text-success' : 'text-muted-foreground opacity-50'}`}>{d.status}</p>
                                    </div>
                                 </Link>
                               ))}
                               {selectedDayInfo.pyqs.map((p: any) => (
                                 <Link key={p._id} to="/pyq" className="flex items-center gap-3 md:gap-4 bg-background/50 border border-primary/5 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 transition-all hover:border-primary/20">
                                    <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg md:rounded-xl font-black text-[10px] md:text-xs">P</div>
                                    <div className="flex-1 min-w-0">
                                       <p className="text-xs md:text-sm font-black text-foreground truncate">{p.title}</p>
                                       <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-primary/60">Past Year Question</p>
                                    </div>
                                 </Link>
                               ))}
                               {selectedDayInfo.tests.map((t: any) => (
                                 <Link key={t._id} to="/test-series" className="flex items-center gap-3 md:gap-4 bg-destructive/5 border border-destructive/10 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 hover:bg-destructive/10 transition-all group">
                                    <Award className="h-5 w-5 md:h-6 md:w-6 text-destructive group-hover:scale-110 transition-transform" />
                                    <div className="flex-1 min-w-0">
                                       <p className="text-xs md:text-sm font-black text-foreground truncate">{t.title}</p>
                                       <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-destructive/60">{t.type}</p>
                                    </div>
                                 </Link>
                               ))}
                               {selectedDayInfo.quizzes.map((q: any) => (
                                 <Link key={q._id} to="/quizzes" className="flex items-center gap-3 md:gap-4 bg-accent/5 border border-accent/10 rounded-2xl md:rounded-[1.5rem] p-3 md:p-4 hover:bg-accent/10 transition-all group">
                                    <Zap className="h-5 w-5 md:h-6 md:w-6 text-accent animate-pulse" />
                                    <div className="flex-1 min-w-0">
                                       <p className="text-xs md:text-sm font-black text-foreground">Assessment Quizzes</p>
                                       <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-accent/60">{q.quizzes?.length || 0} Units Locked</p>
                                    </div>
                                 </Link>
                               ))}
                            </div>
                         </div>
                      )}

                      {/* All Empty */}
                      {!selectedDayInfo.topics.length && !selectedDayInfo.revisions.length && !selectedDayInfo.dpps.length && !selectedDayInfo.pyqs.length && !selectedDayInfo.tests.length && !selectedDayInfo.quizzes.length && (
                         <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center space-y-4 opacity-30">
                            <MoreHorizontal className="h-10 w-10 md:h-12 md:w-12" />
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Rest Protocol Active</p>
                         </div>
                      )}
                    </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center space-y-4 opacity-30">
                        <MoreHorizontal className="h-10 w-10 md:h-12 md:w-12" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">No Recorded Activity</p>
                     </div>
                  )}
                </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 md:py-20 text-center space-y-5 opacity-30">
                     <CalendarIcon className="h-12 w-12 md:h-16 md:w-16" />
                     <div className="space-y-1">
                        <p className="font-black text-xs md:text-sm uppercase tracking-[0.2em]">Oracle Calendar</p>
                        <p className="text-[9px] md:text-[10px] font-bold">Select a node to inspect logs</p>
                     </div>
                  </div>
              )}
            </div>
          </div>

          {/* ── Side Calendar Navigator ───────────────────────────────────── */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6 md:space-y-8">
            {renderHeader()}
            <div className="bg-card/30 backdrop-blur-md border border-primary/5 rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-2xl">
              {renderDays()}
              {!loading ? renderCells() : (
                <div className="flex justify-center pt-10">
                  <Loader2 className="h-8 w-8 text-primary animate-spin opacity-40" />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Planner;
