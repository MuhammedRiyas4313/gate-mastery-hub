import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useDPPs(month?: number, year?: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dpps', month, year],
    queryFn: async () => {
      const { data } = await api.get('/dpp', { params: { month, year } });
      return data;
    },
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

