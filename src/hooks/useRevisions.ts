import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/rest-client';

interface RevisionFilters {
  status?: string;
  subjectId?: string;
  chapterId?: string;
  sortBy?: string;
}

export function useRevisions(filters: RevisionFilters = {}) {
  const queryClient = useQueryClient();

  const { status, subjectId, chapterId, sortBy } = filters;

  const query = useQuery({
    queryKey: ['revisions', { status, subjectId, chapterId, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (subjectId && subjectId !== 'all') params.set('subjectId', subjectId);
      if (chapterId && chapterId !== 'all') params.set('chapterId', chapterId);
      if (sortBy) params.set('sortBy', sortBy);
      const qs = params.toString();
      const { data } = await api.get(`/revisions${qs ? `?${qs}` : ''}`);
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const updateRevision = useMutation({
    mutationFn: async (vars: any) => api.put('/revisions', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteRevision = useMutation({
    mutationFn: async (id: string) => api.delete(`/revisions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    ...query,
    updateRevision,
    deleteRevision,
  };
}
