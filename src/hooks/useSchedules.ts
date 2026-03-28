import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/rest-client';

export interface Schedule {
    _id: string;
    title: string;
    originalFileName: string;
    fileUrl: string;
    startDate: string;
    endDate: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    createdAt: string;
}

export function useSchedules() {
    return useQuery<Schedule[]>({
        queryKey: ['schedules'],
        queryFn: async () => {
            const { data } = await api.get('/schedules');
            return data;
        }
    });
}

export function useUploadSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post('/schedules', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
    });
}

export function useDeleteSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/schedules/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
        }
    });
}
