import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/rest-client';

interface DPPFilters {
  status?: string;
  subjectId?: string;
  chapterId?: string;
}

export function useDPPs(filters: DPPFilters = {}) {
  const queryClient = useQueryClient();

  const { status, subjectId, chapterId } = filters;

  const query = useQuery({
    queryKey: ['dpps', { status, subjectId, chapterId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (subjectId && subjectId !== 'all') params.set('subjectId', subjectId);
      if (chapterId && chapterId !== 'all') params.set('chapterId', chapterId);
      const qs = params.toString();
      const { data } = await api.get(`/dpp${qs ? `?${qs}` : ''}`);
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const updateDPP = useMutation({
    mutationFn: async (vars: any) => api.put('/dpp', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dpps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteDPP = useMutation({
    mutationFn: async (id: string) => api.delete(`/dpp/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dpps'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    updateDPP,
    deleteDPP,
  };
}
