import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/rest-client";

export const useChapters = (subjectId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const response = await api.get(`/subjects/${subjectId}/chapters`);
      return response.data;
    },
    enabled: !!subjectId,
  });

  return {
    ...query,
  };
};
