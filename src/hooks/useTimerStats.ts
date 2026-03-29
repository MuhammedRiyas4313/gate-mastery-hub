import { useQuery } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export interface DailyTimerStats {
  date?: string;
  totalSeconds: number;
  untaggedSeconds: number;
  subjects: {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
    totalStudySeconds: number;
    chapters: { _id: string; name: string; totalStudySeconds: number }[];
  }[];
}

export interface Session {
  _id: string;
  duration: number;
  startTime: string;
  endTime?: string;
  subject?: { _id: string; name: string; icon: string; color: string } | null;
  chapter?: { _id: string; name: string } | null;
}

export interface TimerStatsResponse {
  allTime: DailyTimerStats;
  daily: DailyTimerStats[];
  sessions: Session[];
}

export const useTimerStats = () => {
  return useQuery<TimerStatsResponse>({
    queryKey: ['timerStats'],
    queryFn: async () => {
      const res = await api.get('/timer/stats');
      return res.data;
    },
  });
};
