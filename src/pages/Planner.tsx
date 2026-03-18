import { useStore } from "@/store/useStore";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Planner() {
  const { subjects, topics, revisions, dpps } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getDayInfo = (day: number) => {
    const dateStr = getDateStr(day);
    const dayTopics = topics.filter((t) => t.dateTaught === dateStr);
    const dayRevisions = revisions.filter((r) => r.scheduledDate === dateStr);
    const dayDPP = dpps.find((d) => d.date === dateStr);
    const colors = new Set<string>();
    dayTopics.forEach((t) => {
      const sub = subjects.find((s) => s.id === t.subjectId);
      if (sub) colors.add(sub.color);
    });
    dayRevisions.forEach((r) => {
      const topic = topics.find((t) => t.id === r.topicId);
      if (topic) {
        const sub = subjects.find((s) => s.id === topic.subjectId);
        if (sub) colors.add(sub.color);
      }
    });
    const totalItems = dayTopics.length + dayRevisions.length + (dayDPP ? 1 : 0);
    const doneItems = dayTopics.filter((t) => t.lectureStatus === 'done').length +
      dayRevisions.filter((r) => r.status === 'done').length +
      (dayDPP?.status === 'done' ? 1 : 0);
    return { colors: Array.from(colors), totalItems, doneItems, dayTopics, dayRevisions, dayDPP };
  };

  const prev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const next = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectedInfo = selectedDay ? (() => {
    const day = parseInt(selectedDay.split('-')[2]);
    return getDayInfo(day);
  })() : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Daily Planner</h1>
        <p className="text-sm text-muted-foreground mt-1">Calendar view of your study schedule</p>
      </div>

      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="p-2 hover:bg-secondary rounded-lg"><ChevronLeft className="h-4 w-4" /></button>
          <h2 className="font-heading font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={next} className="p-2 hover:bg-secondary rounded-lg"><ChevronRight className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dateStr = getDateStr(day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;
            const info = getDayInfo(day);

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${
                  isSelected ? 'bg-primary/20 border border-primary/40' :
                  isToday ? 'bg-primary/10 text-primary border border-primary/30' : 'hover:bg-secondary/50'
                }`}
              >
                <span className={`font-mono text-xs ${isToday ? 'font-bold' : ''}`}>{day}</span>
                {info.colors.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {info.colors.slice(0, 3).map((c, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && selectedInfo && (
        <div className="bg-card rounded-xl p-5 space-y-4">
          <h3 className="font-heading text-base font-semibold">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>

          {selectedInfo.dayTopics.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Topics Taught</p>
              {selectedInfo.dayTopics.map((t) => {
                const sub = subjects.find((s) => s.id === t.subjectId);
                return (
                  <div key={t.id} className="flex items-center gap-2 py-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${t.lectureStatus === 'done' ? 'bg-success/20 text-success' : 'bg-secondary text-muted-foreground'}`}>L</span>
                    <span className="text-sm text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{sub?.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {selectedInfo.dayRevisions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Revisions Scheduled</p>
              {selectedInfo.dayRevisions.map((r) => {
                const topic = topics.find((t) => t.id === r.topicId);
                const sub = topic ? subjects.find((s) => s.id === topic.subjectId) : undefined;
                return (
                  <div key={r.id} className="flex items-center gap-2 py-1">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${r.status === 'done' ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'}`}>R{r.revisionNumber}</span>
                    <span className="text-sm text-foreground">{topic?.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{sub?.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {selectedInfo.dayDPP && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">DPP</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selectedInfo.dayDPP.status === 'done' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {selectedInfo.dayDPP.status}
                </span>
                <span className="text-sm text-foreground">Daily Practice Paper</span>
              </div>
            </div>
          )}

          {selectedInfo.totalItems === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nothing scheduled for this day</p>
          )}
        </div>
      )}
    </div>
  );
}
