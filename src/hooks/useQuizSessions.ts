import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useQuizSessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['quiz-sessions'],
    queryFn: async () => {
      const { data } = await api.get('/quiz-sessions');
      return data;
    },
  });

  const addSession = useMutation({
    mutationFn: async (vars: any) => api.post('/quiz-sessions', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...vars }: any) => api.put(`/quiz-sessions/${id}`, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => api.delete(`/quiz-sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    addSession,
    updateSession,
    deleteSession,
  };
}
