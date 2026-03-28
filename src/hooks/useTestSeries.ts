import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/rest-client';

interface TestSeriesFilters {
  status?: string;
  subjectId?: string;
  chapterId?: string;
  type?: string;
}

export function useTestSeries(filters: TestSeriesFilters = {}) {
  const queryClient = useQueryClient();

  const { status, subjectId, chapterId, type } = filters;

  const query = useQuery({
    queryKey: ['testSeries', { status, subjectId, chapterId, type }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (subjectId && subjectId !== 'all') params.set('subjectId', subjectId);
      if (chapterId && chapterId !== 'all') params.set('chapterId', chapterId);
      if (type && type !== 'all') params.set('type', type);
      const qs = params.toString();
      const { data } = await api.get(`/test-series${qs ? `?${qs}` : ''}`);
      return data;
    },
    placeholderData: keepPreviousData,
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
