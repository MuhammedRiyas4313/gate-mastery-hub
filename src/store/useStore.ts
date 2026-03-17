import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskType = 'lecture' | 'dpp' | 'quiz' | 'revision' | 'pyq' | 'notes';
export type TaskStatus = 'pending' | 'done' | 'skipped';
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  moduleId: string;
  type: TaskType;
  label: string;
  status: TaskStatus;
  dueDate: string;
  completedAt?: string;
  revisionCount: number;
  nextRevisionDate?: string;
}

export interface Module {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
  dateTaught?: string;
  status: ModuleStatus;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  startDate: string;
  isActive: boolean;
}

export interface DailyPlan {
  id: string;
  date: string;
  subjectIds: string[];
  moduleIds: string[];
  notes: string;
}

export interface QuizEntry {
  id: string;
  moduleId: string;
  weekNumber: number;
  label: string;
  status: TaskStatus;
  score?: number;
  totalMarks?: number;
}

interface StoreState {
  subjects: Subject[];
  modules: Module[];
  tasks: Task[];
  dailyPlans: DailyPlan[];
  quizzes: QuizEntry[];
  gateExamDate: string;
  streak: number;
  lastActiveDate: string;

  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addModule: (mod: Omit<Module, 'id'>) => void;
  updateModule: (id: string, data: Partial<Module>) => void;
  deleteModule: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  markRevisionDone: (taskId: string) => void;
  snoozeRevision: (taskId: string) => void;
  addQuiz: (quiz: Omit<QuizEntry, 'id'>) => void;
  updateQuiz: (id: string, data: Partial<QuizEntry>) => void;
  addDailyPlan: (plan: Omit<DailyPlan, 'id'>) => void;
  updateDailyPlan: (id: string, data: Partial<DailyPlan>) => void;
  updateStreak: () => void;
  setGateExamDate: (date: string) => void;
  addModuleWithTasks: (subjectId: string, moduleName: string, dateTaught: string, orderIndex: number) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const addDays = (dateStr: string, days: number): string => {
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
      modules: [],
      tasks: [],
      dailyPlans: [],
      quizzes: [],
      gateExamDate: '2027-02-01',
      streak: 0,
      lastActiveDate: '',

      addSubject: (subject) => set((s) => ({
        subjects: [...s.subjects, { ...subject, id: uid() }],
      })),

      updateSubject: (id, data) => set((s) => ({
        subjects: s.subjects.map((sub) => sub.id === id ? { ...sub, ...data } : sub),
      })),

      deleteSubject: (id) => set((s) => {
        const modIds = s.modules.filter((m) => m.subjectId === id).map((m) => m.id);
        return {
          subjects: s.subjects.filter((sub) => sub.id !== id),
          modules: s.modules.filter((m) => m.subjectId !== id),
          tasks: s.tasks.filter((t) => !modIds.includes(t.moduleId)),
        };
      }),

      addModule: (mod) => set((s) => ({
        modules: [...s.modules, { ...mod, id: uid() }],
      })),

      updateModule: (id, data) => set((s) => ({
        modules: s.modules.map((m) => m.id === id ? { ...m, ...data } : m),
      })),

      deleteModule: (id) => set((s) => ({
        modules: s.modules.filter((m) => m.id !== id),
        tasks: s.tasks.filter((t) => t.moduleId !== id),
      })),

      addTask: (task) => set((s) => ({
        tasks: [...s.tasks, { ...task, id: uid() }],
      })),

      updateTask: (id, data) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, ...data } : t),
      })),

      toggleTaskStatus: (id) => set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== id) return t;
          const newStatus = t.status === 'done' ? 'pending' : 'done';
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'done' ? today() : undefined,
          };
        }),
      })),

      markRevisionDone: (taskId) => set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const newCount = t.revisionCount + 1;
          const nextInterval = REVISION_INTERVALS[Math.min(newCount, REVISION_INTERVALS.length - 1)];
          return {
            ...t,
            status: 'done' as TaskStatus,
            completedAt: today(),
            revisionCount: newCount,
            nextRevisionDate: addDays(today(), nextInterval),
          };
        }),
      })),

      snoozeRevision: (taskId) => set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            dueDate: addDays(today(), 1),
            nextRevisionDate: addDays(today(), 1),
          };
        }),
      })),

      addQuiz: (quiz) => set((s) => ({
        quizzes: [...s.quizzes, { ...quiz, id: uid() }],
      })),

      updateQuiz: (id, data) => set((s) => ({
        quizzes: s.quizzes.map((q) => q.id === id ? { ...q, ...data } : q),
      })),

      addDailyPlan: (plan) => set((s) => ({
        dailyPlans: [...s.dailyPlans, { ...plan, id: uid() }],
      })),

      updateDailyPlan: (id, data) => set((s) => ({
        dailyPlans: s.dailyPlans.map((p) => p.id === id ? { ...p, ...data } : p),
      })),

      updateStreak: () => set((s) => {
        const t = today();
        const yesterday = addDays(t, -1);
        if (s.lastActiveDate === t) return s;
        const newStreak = s.lastActiveDate === yesterday ? s.streak + 1 : 1;
        return { streak: newStreak, lastActiveDate: t };
      }),

      setGateExamDate: (date) => set({ gateExamDate: date }),

      addModuleWithTasks: (subjectId, moduleName, dateTaught, orderIndex) => {
        const moduleId = uid();
        const newModule: Module = {
          id: moduleId,
          subjectId,
          name: moduleName,
          orderIndex,
          dateTaught,
          status: 'not_started',
        };

        const autoTasks: Task[] = [
          { id: uid(), moduleId, type: 'lecture', label: 'Lecture', status: 'pending', dueDate: dateTaught, revisionCount: 0 },
          { id: uid(), moduleId, type: 'dpp', label: 'DPP', status: 'pending', dueDate: dateTaught, revisionCount: 0 },
          { id: uid(), moduleId, type: 'revision', label: 'Revision 1', status: 'pending', dueDate: addDays(dateTaught, 1), revisionCount: 0, nextRevisionDate: addDays(dateTaught, 1) },
          { id: uid(), moduleId, type: 'revision', label: 'Revision 2', status: 'pending', dueDate: addDays(dateTaught, 3), revisionCount: 0, nextRevisionDate: addDays(dateTaught, 3) },
          { id: uid(), moduleId, type: 'revision', label: 'Revision 3', status: 'pending', dueDate: addDays(dateTaught, 7), revisionCount: 0, nextRevisionDate: addDays(dateTaught, 7) },
          { id: uid(), moduleId, type: 'pyq', label: 'PYQ Practice', status: 'pending', dueDate: addDays(dateTaught, 14), revisionCount: 0 },
        ];

        set((s) => ({
          modules: [...s.modules, newModule],
          tasks: [...s.tasks, ...autoTasks],
        }));
      },
    }),
    {
      name: 'gate-tracker-store',
    }
  )
);

// Initialize with seed data if empty
const initializeStore = () => {
  const state = useStore.getState();
  if (state.subjects.length > 0) return;

  const seedData: { name: string; icon: string; color: string; modules: string[] }[] = [
    {
      name: 'Linear Algebra', icon: '📘', color: '#4f8ef7',
      modules: ['Matrices', 'Determinants', 'Eigenvalues & Eigenvectors', 'Systems of Linear Equations', 'Rank of a Matrix'],
    },
    {
      name: 'Probability', icon: '📊', color: '#f5a623',
      modules: ['Basic Probability', 'Conditional Probability', "Bayes' Theorem", 'Random Variables', 'Distributions (Binomial, Poisson, Normal)'],
    },
    {
      name: 'Discrete Mathematics', icon: '🔢', color: '#3ecfcf',
      modules: ['Set Theory', 'Graph Theory', 'Combinatorics', 'Logic & Propositional Calculus', 'Relations & Functions'],
    },
  ];

  const t = new Date().toISOString().split('T')[0];

  seedData.forEach((sub) => {
    const subjectId = Math.random().toString(36).slice(2, 10);
    useStore.setState((s) => ({
      subjects: [...s.subjects, {
        id: subjectId, name: sub.name, icon: sub.icon, color: sub.color, startDate: t, isActive: true,
      }],
    }));
    sub.modules.forEach((modName, i) => {
      const dateTaught = new Date();
      dateTaught.setDate(dateTaught.getDate() - (sub.modules.length - i) * 2);
      const dt = dateTaught.toISOString().split('T')[0];
      useStore.getState().addModuleWithTasks(subjectId, modName, dt, i);
    });
  });
};

initializeStore();
