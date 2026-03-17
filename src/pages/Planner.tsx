import { useStore } from "@/store/useStore";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Planner() {
  const { tasks, subjects, modules } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const todayStr = new Date().toISOString().split('T')[0];

  const getDayTasks = (day: number) => {
    const dateStr = getDateStr(day);
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const getDaySubjectColors = (day: number) => {
    const dayTasks = getDayTasks(day);
    const subjectColors = new Set<string>();
    dayTasks.forEach((t) => {
      const mod = modules.find((m) => m.id === t.moduleId);
      if (mod) {
        const sub = subjects.find((s) => s.id === mod.subjectId);
        if (sub) subjectColors.add(sub.color);
      }
    });
    return Array.from(subjectColors);
  };

  const prev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const next = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Daily Planner</h1>
        <p className="text-sm text-muted-foreground mt-1">Calendar view of your study schedule</p>
      </div>

      <div className="bg-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prev} className="p-2 hover:bg-secondary rounded-lg"><ChevronLeft className="h-4 w-4" /></button>
          <h2 className="font-heading font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
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
            const colors = getDaySubjectColors(day);
            const dayTasks = getDayTasks(day);
            const doneTasks = dayTasks.filter((t) => t.status === 'done').length;

            return (
              <div
                key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  isToday ? 'bg-primary/15 text-primary border border-primary/30' : 'hover:bg-secondary/50'
                }`}
              >
                <span className={`font-mono text-xs ${isToday ? 'font-bold' : ''}`}>{day}</span>
                {colors.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {colors.slice(0, 3).map((c, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
