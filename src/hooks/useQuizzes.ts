import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useQuizzes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data } = await api.get('/quizzes');
      return data;
    },
  });

  const addQuiz = useMutation({
    mutationFn: async (vars: any) => api.post('/quizzes', vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const updateQuiz = useMutation({
    mutationFn: async (vars: any) => api.put(`/quizzes/${vars.id}`, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => api.delete(`/quizzes/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  return {
    ...query,
    addQuiz,
    updateQuiz,
    deleteQuiz,
  };
}

