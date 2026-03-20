import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, parseISO } from "date-fns";

const WEEKS = 24;
const DAYS = 7;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(level: number): string {
  if (level === 0) return "hsl(var(--secondary) / 0.5)";
  if (level === 1) return "hsl(var(--primary) / 0.25)";
  if (level === 2) return "hsl(var(--primary) / 0.5)";
  if (level === 3) return "hsl(var(--primary) / 0.75)";
  return "hsl(var(--primary))";
}

interface ActivityPoint {
    date: string;
    count: number;
    level: number;
}

export function ActivityHeatmap({ data }: { data?: ActivityPoint[] }) {
  const grid = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 1 });

    const dataMap = new Map<string, ActivityPoint>();
    data?.forEach(p => {
        dataMap.set(p.date.split('T')[0], p);
    });

    const weeks: { date: Date; count: number; level: number }[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const week: { date: Date; count: number; level: number }[] = [];
      for (let d = 0; d < DAYS; d++) {
        const date = addDays(start, w * 7 + d);
        const key = format(date, "yyyy-MM-dd");
        const point = dataMap.get(key);
        week.push({ date, count: point?.count || 0, level: point?.level || 0 });
      }
      weeks.push(week);
    }
    return weeks;
  }, [data]);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-primary/5 rounded-[2.5rem] p-8 shadow-sm">
      <h3 className="font-heading text-lg font-bold mb-6 flex items-center gap-3">
         <span className="text-2xl">🔥</span> Study Consistency Heatmap
      </h3>
      <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex flex-col justify-between py-1 mr-2 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter h-[11px] flex items-center">{label}</span>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((day, di) => (
              <div
                key={di}
                className="w-4 h-4 rounded-[4px] transition-all duration-500 hover:scale-125 hover:z-10 cursor-help border border-primary/5"
                style={{ backgroundColor: getIntensity(day.level) }}
                title={`${format(day.date, "MMM d, yyyy")}: ${day.count} activities`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2.5 mt-4">
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Cold</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="w-3.5 h-3.5 rounded-[3px] border border-primary/5"
            style={{ backgroundColor: getIntensity(lvl) }}
          />
        ))}
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Hot</span>
      </div>
    </div>
  );
}
