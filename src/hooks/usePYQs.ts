import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/rest-client';

interface PYQFilters {
  status?: string;
  subjectId?: string;
  chapterId?: string;
}

export function usePYQs(filters: PYQFilters = {}) {
  const queryClient = useQueryClient();

  const { status, subjectId, chapterId } = filters;

  const query = useQuery({
    queryKey: ['pyqs', { status, subjectId, chapterId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (subjectId && subjectId !== 'all') params.set('subjectId', subjectId);
      if (chapterId && chapterId !== 'all') params.set('chapterId', chapterId);
      const qs = params.toString();
      const { data } = await api.get(`/pyqs${qs ? `?${qs}` : ''}`);
      return data;
    },
    placeholderData: keepPreviousData,
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
