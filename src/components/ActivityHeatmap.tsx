import { useMemo } from "react";
import { useStore, Task } from "@/store/useStore";
import { format, subDays, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";

const WEEKS = 20;
const DAYS = 7;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(count: number, max: number): string {
  if (count === 0) return "hsl(var(--secondary))";
  const ratio = count / max;
  if (ratio <= 0.25) return "hsl(var(--accent) / 0.3)";
  if (ratio <= 0.5) return "hsl(var(--accent) / 0.5)";
  if (ratio <= 0.75) return "hsl(var(--accent) / 0.75)";
  return "hsl(var(--accent))";
}

export function ActivityHeatmap() {
  const { tasks } = useStore();

  const { grid, max } = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 1 });

    // Count completed tasks per day
    const countMap = new Map<string, number>();
    tasks.forEach((t: Task) => {
      if (t.status === "done" && t.completedAt) {
        const key = t.completedAt.slice(0, 10);
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
    });

    let maxCount = 1;
    const weeks: { date: Date; count: number }[][] = [];

    for (let w = 0; w < WEEKS; w++) {
      const week: { date: Date; count: number }[] = [];
      for (let d = 0; d < DAYS; d++) {
        const date = addDays(start, w * 7 + d);
        const key = format(date, "yyyy-MM-dd");
        const count = countMap.get(key) || 0;
        if (count > maxCount) maxCount = count;
        week.push({ date, count });
      }
      weeks.push(week);
    }

    return { grid: weeks, max: maxCount };
  }, [tasks]);

  return (
    <div className="bg-card rounded-xl p-6">
      <h3 className="font-heading text-base font-semibold mb-4">Study Activity Heatmap</h3>
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="text-[10px] text-muted-foreground h-[14px] leading-[14px]">
              {label}
            </span>
          ))}
        </div>
        {/* Weeks */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                className="w-[14px] h-[14px] rounded-sm transition-colors"
                style={{ backgroundColor: getIntensity(day.count, max) }}
                title={`${format(day.date, "MMM d, yyyy")}: ${day.count} tasks`}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <div
            key={i}
            className="w-[14px] h-[14px] rounded-sm"
            style={{
              backgroundColor:
                ratio === 0
                  ? "hsl(var(--secondary))"
                  : `hsl(var(--accent) / ${ratio <= 0.25 ? 0.3 : ratio <= 0.5 ? 0.5 : ratio <= 0.75 ? 0.75 : 1})`,
            }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}
