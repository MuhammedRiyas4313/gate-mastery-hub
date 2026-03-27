import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useTestSeries() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['testSeries'],
    queryFn: async () => {
      const { data } = await api.get('/test-series');
      return data;
    },
  });

  const addTestSeries = useMutation({
    mutationFn: async (vars: any) => api.post('/test-series', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSeries'] });
    },
  });

  const updateTestSeries = useMutation({
    mutationFn: async ({ id, ...vars }: any) => api.put(`/test-series/${id}`, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testSeries'] });
    },
  });

  const deleteTestSeries = useMutation({
    mutationFn: async (id: string) => api.delete(`/test-series/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['testSeries'] });
    },
  });


  return {
    ...query,
    addTestSeries,
    updateTestSeries,
    deleteTestSeries,
  };
}
