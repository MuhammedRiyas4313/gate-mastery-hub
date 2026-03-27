import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export function useSubjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await api.get('/subjects');
      return data;
    },
  });

  const addSubject = useMutation({
    mutationFn: async (vars: any) => api.post('/subjects', vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({ id, ...data }: any) => api.put(`/subjects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const addChapter = useMutation({
    mutationFn: async ({ subjectId, ...vars }: any) => 
      api.post(`/subjects/${subjectId}/chapters`, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateChapter = useMutation({
    mutationFn: async ({ id, ...data }: any) => api.put(`/subjects/chapters/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const addTopic = useMutation({
    mutationFn: async ({ chapterId, ...vars }: any) => 
      api.post(`/subjects/chapters/${chapterId}/topics`, vars),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateTopic = useMutation({
    mutationFn: async ({ id, ...data }: any) => api.put(`/subjects/topics/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const removeChapter = useMutation({
    mutationFn: async (id: string) => api.delete(`/subjects/chapters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const removeTopic = useMutation({
    mutationFn: async (id: string) => api.delete(`/subjects/topics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  return {
    ...query,
    addSubject,
    updateSubject,
    addChapter,
    updateChapter,
    addTopic,
    updateTopic,
    deleteChapter: removeChapter,
    deleteTopic: removeTopic,
  };
}

