import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function usePYQs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['pyqs'],
    queryFn: async () => {
      const { data } = await api.get('/pyqs');
      return data;
    },
  });

  const addPYQ = useMutation({
    mutationFn: async (vars: any) => api.post('/pyqs', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqs'] });
    },
  });

  const updatePYQ = useMutation({
    mutationFn: async ({ id, ...vars }: any) => api.put(`/pyqs/${id}`, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqs'] });
    },
  });

  const deletePYQ = useMutation({
    mutationFn: async (id: string) => api.delete(`/pyqs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pyqs'] });
    },
  });

  return {
    ...query,
    addPYQ,
    updatePYQ,
    deletePYQ,
  };
}
