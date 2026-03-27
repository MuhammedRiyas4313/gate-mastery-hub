import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useExams() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data } = await api.get('/exams');
      return data;
    },
  });

  const addExam = useMutation({
    mutationFn: async (vars: any) => api.post('/exams', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateExam = useMutation({
    mutationFn: async ({ id, ...vars }: any) => api.put(`/exams/${id}`, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => api.delete(`/exams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    addExam,
    updateExam,
    deleteExam,
  };
}
