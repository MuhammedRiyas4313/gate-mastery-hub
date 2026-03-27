import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard');
      return data;
    },
  });

  const toggleLecture = useMutation({
    mutationFn: async ({ topicId, status }: { topicId: string; status: string }) => {
      // In our REST API, we update topic directly
      return api.put(`/subjects/topics/${topicId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateDPPStatus = useMutation({
    mutationFn: async ({ id, date, status }: { id?: string; date?: string; status: string }) => {
      return api.put(`/dpp`, { id, date, status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });


  const updateRevision = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
       return api.put(`/revisions/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  return {
    ...query,
    toggleLecture,
    updateDPP: updateDPPStatus,
    updateRevision,
  };
}

