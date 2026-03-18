import { useStore } from "@/store/useStore";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DPPPage() {
  const { subjects, chapters, topics, dpps, toggleDPPStatus, updateDPP, ensureDPP } = useStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Ensure today's DPP exists
  useMemo(() => { ensureDPP(todayStr); }, [todayStr]);

  const filtered = useMemo(() => {
    let list = [...dpps].sort((a, b) => b.date.localeCompare(a.date));
    if (filterStatus !== 'all') list = list.filter((d) => d.status === filterStatus);
    if (filterSubject !== 'all') list = list.filter((d) => d.subjectTags.includes(filterSubject));
    return list;
  }, [dpps, filterStatus, filterSubject]);

  // Streak
  const streak = useMemo(() => {
    const sorted = [...dpps].filter((d) => d.status === 'done').map((d) => d.date).sort().reverse();
    let count = 0;
    let current = new Date();
    for (const dateStr of sorted) {
      const expected = current.toISOString().split('T')[0];
      if (dateStr === expected) {
        count++;
        current.setDate(current.getDate() - 1);
      } else if (dateStr < expected) {
        break;
      }
    }
    return count;
  }, [dpps]);

  const completionRate = dpps.length > 0 ? Math.round((dpps.filter((d) => d.status === 'done').length / dpps.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">DPP Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">One DPP per day. Auto-created, manually completable.</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {[
          { label: 'Total DPPs', value: dpps.length, cls: 'text-foreground' },
          { label: 'Done', value: dpps.filter((d) => d.status === 'done').length, cls: 'text-success' },
          { label: 'Streak', value: `${streak}d`, cls: 'text-primary' },
          { label: 'Rate', value: `${completionRate}%`, cls: 'text-accent' },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl px-4 py-3 text-center flex-1">
            <p className={`font-mono text-lg font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5">
          <option value="all">All Subjects</option>{subjects.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-card text-sm text-foreground border border-border rounded-lg px-3 py-1.5">
          <option value="all">All Status</option><option value="pending">Pending</option><option value="done">Done</option><option value="skipped">Skipped</option>
        </select>
      </div>

      {/* DPP list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl">
            <p className="text-4xl mb-4">📋</p>
            <h3 className="font-heading text-lg font-semibold">No DPPs found</h3>
          </div>
        ) : (
          filtered.map((dpp) => {
            const dateLabel = new Date(dpp.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
            const isToday = dpp.date === todayStr;
            return (
              <div key={dpp.id} className={`bg-card rounded-xl px-5 py-4 space-y-3 ${isToday ? 'border border-primary/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{dateLabel}</p>
                    {isToday && <span className="text-[10px] text-primary font-semibold">TODAY</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {dpp.score !== undefined && dpp.totalMarks && (
                      <span className="font-mono text-sm text-primary">{dpp.score}/{dpp.totalMarks}</span>
                    )}
                    <Button
                      size="sm"
                      variant={dpp.status === 'done' ? 'secondary' : 'default'}
                      className="h-7 text-xs"
                      onClick={() => toggleDPPStatus(dpp.id)}
                    >
                      {dpp.status === 'done' ? '✓ Done' : dpp.status === 'skipped' ? 'Skipped' : 'Mark Done'}
                    </Button>
                  </div>
                </div>

                {/* Auto-tags */}
                {dpp.subjectTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {dpp.subjectTags.map((sid) => {
                      const s = subjects.find((sub) => sub.id === sid);
                      return s ? <span key={sid} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: s.color + '20', color: s.color }}>{s.icon} {s.name}</span> : null;
                    })}
                    {dpp.topicTags.map((tid) => {
                      const t = topics.find((top) => top.id === tid);
                      return t ? <span key={tid} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{t.name}</span> : null;
                    })}
                  </div>
                )}

                {/* Score input */}
                {editingNotes === dpp.id && (
                  <div className="flex gap-3">
                    <Input
                      type="number" placeholder="Score"
                      defaultValue={dpp.score}
                      onChange={(e) => updateDPP(dpp.id, { score: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-sm w-20"
                    />
                    <Input
                      type="number" placeholder="Total"
                      defaultValue={dpp.totalMarks}
                      onChange={(e) => updateDPP(dpp.id, { totalMarks: e.target.value ? Number(e.target.value) : undefined })}
                      className="h-8 text-sm w-20"
                    />
                    <Textarea
                      placeholder="Notes..."
                      defaultValue={dpp.notes}
                      onChange={(e) => updateDPP(dpp.id, { notes: e.target.value })}
                      className="text-sm flex-1 min-h-[32px]"
                    />
                  </div>
                )}

                <button
                  onClick={() => setEditingNotes(editingNotes === dpp.id ? null : dpp.id)}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  {editingNotes === dpp.id ? 'Close' : 'Edit score & notes'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
