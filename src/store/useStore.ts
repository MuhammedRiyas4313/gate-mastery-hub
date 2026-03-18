import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────
export type ChapterStatus = 'not_started' | 'in_progress' | 'completed';
export type RevisionStatus = 'pending' | 'done' | 'snoozed' | 'skipped';
export type LectureStatus = 'pending' | 'done' | 'skipped';
export type PYQDifficulty = 'easy' | 'medium' | 'hard';
export type PYQStatus = 'not_started' | 'in_progress' | 'done';
export type QuizStatus = 'pending' | 'done' | 'missed';
export type DPPStatus = 'pending' | 'done' | 'skipped';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  startDate: string;
  isActive: boolean;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
  status: ChapterStatus;
}

export interface Topic {
  id: string;
  chapterId: string;
  subjectId: string;
  name: string;
  dateTaught?: string;
  orderIndex: number;
  lectureStatus: LectureStatus;
  lectureCompletedAt?: string;
}

export interface RevisionInstance {
  id: string;
  topicId: string;
  revisionNumber: number; // 1-5
  scheduledDate: string;
  status: RevisionStatus;
  completedAt?: string;
  snoozedTo?: string;
}

export interface PYQ {
  id: string;
  title: string;
  year?: string;
  source?: string;
  difficulty: PYQDifficulty;
  status: PYQStatus;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  notes: string;
  addedDate: string;
  completedAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  weekNumber?: number;
  quizNumber?: number;
  scheduledDate: string;
  status: QuizStatus;
  score?: number;
  totalMarks?: number;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  notes: string;
  addedDate: string;
}

export interface DPP {
  id: string;
  date: string;
  status: DPPStatus;
  topicTags: string[];
  chapterTags: string[];
  subjectTags: string[];
  score?: number;
  totalMarks?: number;
  notes: string;
  completedAt?: string;
}

export interface DailyLog {
  id: string;
  date: string;
  topicsCovered: string[];
  notes: string;
}

// ── Store ──────────────────────────────────────
interface StoreState {
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  revisions: RevisionInstance[];
  pyqs: PYQ[];
  quizzes: Quiz[];
  dpps: DPP[];
  dailyLogs: DailyLog[];
  gateExamDate: string;
  streak: number;
  lastActiveDate: string;

  // Subject CRUD
  addSubject: (s: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Chapter CRUD
  addChapter: (c: Omit<Chapter, 'id'>) => void;
  updateChapter: (id: string, data: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;

  // Topic CRUD (auto-creates lecture + revisions)
  addTopicWithRevisions: (subjectId: string, chapterId: string, name: string, dateTaught: string, orderIndex: number) => void;
  updateTopic: (id: string, data: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  toggleLecture: (topicId: string) => void;

  // Revision actions
  markRevisionDone: (id: string) => void;
  snoozeRevision: (id: string) => void;
  skipRevision: (id: string) => void;

  // PYQ CRUD
  addPYQ: (p: Omit<PYQ, 'id'>) => void;
  updatePYQ: (id: string, data: Partial<PYQ>) => void;
  deletePYQ: (id: string) => void;

  // Quiz CRUD
  addQuiz: (q: Omit<Quiz, 'id'>) => void;
  updateQuiz: (id: string, data: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;

  // DPP CRUD
  ensureDPP: (date: string) => void;
  updateDPP: (id: string, data: Partial<DPP>) => void;
  toggleDPPStatus: (id: string) => void;

  // Daily log
  logTopicToday: (topicId: string) => void;

  // Misc
  updateStreak: () => void;
  setGateExamDate: (date: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const addDaysToDate = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const today = () => new Date().toISOString().split('T')[0];

const REVISION_INTERVALS = [1, 3, 7, 14, 30];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      subjects: [],
      chapters: [],
      topics: [],
      revisions: [],
      pyqs: [],
      quizzes: [],
      dpps: [],
      dailyLogs: [],
      gateExamDate: '2027-02-01',
      streak: 0,
      lastActiveDate: '',

      // ── Subjects ──
      addSubject: (s) => set((st) => ({ subjects: [...st.subjects, { ...s, id: uid() }] })),
      updateSubject: (id, data) => set((st) => ({ subjects: st.subjects.map((s) => s.id === id ? { ...s, ...data } : s) })),
      deleteSubject: (id) => set((st) => {
        const chapIds = st.chapters.filter((c) => c.subjectId === id).map((c) => c.id);
        const topicIds = st.topics.filter((t) => t.subjectId === id).map((t) => t.id);
        return {
          subjects: st.subjects.filter((s) => s.id !== id),
          chapters: st.chapters.filter((c) => c.subjectId !== id),
          topics: st.topics.filter((t) => t.subjectId !== id),
          revisions: st.revisions.filter((r) => !topicIds.includes(r.topicId)),
        };
      }),

      // ── Chapters ──
      addChapter: (c) => set((st) => ({ chapters: [...st.chapters, { ...c, id: uid() }] })),
      updateChapter: (id, data) => set((st) => ({ chapters: st.chapters.map((c) => c.id === id ? { ...c, ...data } : c) })),
      deleteChapter: (id) => set((st) => {
        const topicIds = st.topics.filter((t) => t.chapterId === id).map((t) => t.id);
        return {
          chapters: st.chapters.filter((c) => c.id !== id),
          topics: st.topics.filter((t) => t.chapterId !== id),
          revisions: st.revisions.filter((r) => !topicIds.includes(r.topicId)),
        };
      }),

      // ── Topics ──
      addTopicWithRevisions: (subjectId, chapterId, name, dateTaught, orderIndex) => {
        const topicId = uid();
        const newTopic: Topic = {
          id: topicId, chapterId, subjectId, name, dateTaught, orderIndex,
          lectureStatus: 'pending',
        };
        const revs: RevisionInstance[] = REVISION_INTERVALS.map((days, i) => ({
          id: uid(),
          topicId,
          revisionNumber: i + 1,
          scheduledDate: addDaysToDate(dateTaught, days),
          status: 'pending' as RevisionStatus,
        }));

        set((st) => {
          // Also ensure DPP for that day
          const existingDPP = st.dpps.find((d) => d.date === dateTaught);
          const chapter = st.chapters.find((c) => c.id === chapterId);
          let dpps = st.dpps;
          if (!existingDPP) {
            dpps = [...dpps, {
              id: uid(), date: dateTaught, status: 'pending' as DPPStatus,
              topicTags: [topicId], chapterTags: [chapterId], subjectTags: [subjectId],
              notes: '',
            }];
          } else {
            dpps = dpps.map((d) => d.date === dateTaught ? {
              ...d,
              topicTags: [...new Set([...d.topicTags, topicId])],
              chapterTags: [...new Set([...d.chapterTags, chapterId])],
              subjectTags: [...new Set([...d.subjectTags, subjectId])],
            } : d);
          }

          return {
            topics: [...st.topics, newTopic],
            revisions: [...st.revisions, ...revs],
            dpps,
          };
        });
      },

      updateTopic: (id, data) => set((st) => ({ topics: st.topics.map((t) => t.id === id ? { ...t, ...data } : t) })),
      deleteTopic: (id) => set((st) => ({
        topics: st.topics.filter((t) => t.id !== id),
        revisions: st.revisions.filter((r) => r.topicId !== id),
      })),

      toggleLecture: (topicId) => set((st) => ({
        topics: st.topics.map((t) => {
          if (t.id !== topicId) return t;
          const newStatus = t.lectureStatus === 'done' ? 'pending' : 'done';
          return { ...t, lectureStatus: newStatus, lectureCompletedAt: newStatus === 'done' ? today() : undefined };
        }),
      })),

      // ── Revisions ──
      markRevisionDone: (id) => set((st) => ({
        revisions: st.revisions.map((r) => r.id === id ? { ...r, status: 'done' as RevisionStatus, completedAt: today() } : r),
      })),

      snoozeRevision: (id) => set((st) => ({
        revisions: st.revisions.map((r) => r.id === id ? {
          ...r, status: 'snoozed' as RevisionStatus,
          snoozedTo: addDaysToDate(today(), 1),
          scheduledDate: addDaysToDate(today(), 1),
        } : r),
      })),

      skipRevision: (id) => set((st) => ({
        revisions: st.revisions.map((r) => r.id === id ? { ...r, status: 'skipped' as RevisionStatus } : r),
      })),

      // ── PYQ ──
      addPYQ: (p) => set((st) => ({ pyqs: [...st.pyqs, { ...p, id: uid() }] })),
      updatePYQ: (id, data) => set((st) => ({ pyqs: st.pyqs.map((p) => p.id === id ? { ...p, ...data } : p) })),
      deletePYQ: (id) => set((st) => ({ pyqs: st.pyqs.filter((p) => p.id !== id) })),

      // ── Quiz ──
      addQuiz: (q) => set((st) => ({ quizzes: [...st.quizzes, { ...q, id: uid() }] })),
      updateQuiz: (id, data) => set((st) => ({ quizzes: st.quizzes.map((q) => q.id === id ? { ...q, ...data } : q) })),
      deleteQuiz: (id) => set((st) => ({ quizzes: st.quizzes.filter((q) => q.id !== id) })),

      // ── DPP ──
      ensureDPP: (date) => set((st) => {
        if (st.dpps.find((d) => d.date === date)) return st;
        return { dpps: [...st.dpps, { id: uid(), date, status: 'pending' as DPPStatus, topicTags: [], chapterTags: [], subjectTags: [], notes: '' }] };
      }),
      updateDPP: (id, data) => set((st) => ({ dpps: st.dpps.map((d) => d.id === id ? { ...d, ...data } : d) })),
      toggleDPPStatus: (id) => set((st) => ({
        dpps: st.dpps.map((d) => {
          if (d.id !== id) return d;
          const newStatus = d.status === 'done' ? 'pending' : 'done';
          return { ...d, status: newStatus, completedAt: newStatus === 'done' ? today() : undefined };
        }),
      })),

      // ── Daily log ──
      logTopicToday: (topicId) => set((st) => {
        const t = today();
        const existing = st.dailyLogs.find((l) => l.date === t);
        if (existing) {
          return { dailyLogs: st.dailyLogs.map((l) => l.date === t ? { ...l, topicsCovered: [...new Set([...l.topicsCovered, topicId])] } : l) };
        }
        return { dailyLogs: [...st.dailyLogs, { id: uid(), date: t, topicsCovered: [topicId], notes: '' }] };
      }),

      // ── Misc ──
      updateStreak: () => set((s) => {
        const t = today();
        const yesterday = addDaysToDate(t, -1);
        if (s.lastActiveDate === t) return s;
        const newStreak = s.lastActiveDate === yesterday ? s.streak + 1 : 1;
        return { streak: newStreak, lastActiveDate: t };
      }),

      setGateExamDate: (date) => set({ gateExamDate: date }),
    }),
    { name: 'gate-tracker-store-v2' }
  )
);

// ── Seed Data ──
const initializeStore = () => {
  const state = useStore.getState();
  if (state.subjects.length > 0) return;

  const seedData = [
    {
      name: 'Linear Algebra', icon: '📘', color: '#4f8ef7',
      chapters: [
        { name: 'Matrices', topics: ['Matrix Operations', 'Types of Matrices', 'Transpose & Inverse'] },
        { name: 'Determinants', topics: ['Definition & Properties', 'Cofactors & Minors', "Cramer's Rule"] },
        { name: 'Eigenvalues & Eigenvectors', topics: ['Characteristic Equation', 'Diagonalization'] },
        { name: 'Systems of Linear Equations', topics: ['Gaussian Elimination', 'Consistency', 'Homogeneous Systems'] },
        { name: 'Rank of a Matrix', topics: ['Row Rank', 'Column Rank', 'Rank-Nullity Theorem'] },
      ],
    },
    {
      name: 'Probability', icon: '📊', color: '#f5a623',
      chapters: [
        { name: 'Basic Probability', topics: ['Sample Space', 'Events', 'Axioms'] },
        { name: 'Conditional Probability', topics: ['Definition', 'Multiplication Rule'] },
        { name: "Bayes' Theorem", topics: ['Formula', 'Applications'] },
        { name: 'Random Variables', topics: ['Discrete RV', 'Continuous RV', 'Expectation & Variance'] },
        { name: 'Distributions', topics: ['Binomial', 'Poisson', 'Normal'] },
      ],
    },
    {
      name: 'Discrete Mathematics', icon: '🔢', color: '#3ecfcf',
      chapters: [
        { name: 'Set Theory', topics: ['Sets & Operations', 'Venn Diagrams', 'Power Sets'] },
        { name: 'Graph Theory', topics: ['Graph Basics', 'Trees', 'Connectivity', 'Planarity'] },
        { name: 'Combinatorics', topics: ['Permutations', 'Combinations', 'Pigeonhole Principle'] },
        { name: 'Logic & Propositional Calculus', topics: ['Propositions', 'Logical Connectives', 'Normal Forms', 'Inference'] },
        { name: 'Relations & Functions', topics: ['Types of Relations', 'Functions', 'Equivalence Relations'] },
      ],
    },
  ];

  const t = new Date().toISOString().split('T')[0];
  let topicCounter = 0;

  seedData.forEach((subData) => {
    const subjectId = Math.random().toString(36).slice(2, 10);
    useStore.setState((s) => ({
      subjects: [...s.subjects, { id: subjectId, name: subData.name, icon: subData.icon, color: subData.color, startDate: t, isActive: true }],
    }));

    subData.chapters.forEach((chapData, ci) => {
      const chapterId = Math.random().toString(36).slice(2, 10);
      useStore.setState((s) => ({
        chapters: [...s.chapters, { id: chapterId, subjectId, name: chapData.name, orderIndex: ci, status: 'not_started' as ChapterStatus }],
      }));

      chapData.topics.forEach((topicName, ti) => {
        topicCounter++;
        const dateTaught = new Date();
        dateTaught.setDate(dateTaught.getDate() - topicCounter * 2);
        const dt = dateTaught.toISOString().split('T')[0];
        useStore.getState().addTopicWithRevisions(subjectId, chapterId, topicName, dt, ti);
      });
    });
  });
};

initializeStore();
