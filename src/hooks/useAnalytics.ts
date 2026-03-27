import { useQuery } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useAnalytics() {
  const query = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data;
    },
  });

  return query;
}

