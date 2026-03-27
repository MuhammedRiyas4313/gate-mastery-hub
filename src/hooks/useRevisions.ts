import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useRevisions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['revisions'],
    queryFn: async () => {
      const { data } = await api.get('/revisions');
      return data;
    },
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
