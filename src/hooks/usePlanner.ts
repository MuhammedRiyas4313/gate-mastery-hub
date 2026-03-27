import { useQuery } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function usePlanner(month: Date) {
  const from = new Date(month.getFullYear(), month.getMonth(), 1);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const query = useQuery({
    queryKey: ['planner', from.toISOString(), to.toISOString()],
    queryFn: async () => {
      const { data } = await api.get('/planner', { 
        params: { from: from.toISOString(), to: to.toISOString() } 
      });
      return data;
    },
  });

  return {
    data: query.data || { topics: [], revisions: [], dpps: [], pyqs: [], tests: [], quizzes: [] },
    isLoading: query.isLoading,
  };
}
