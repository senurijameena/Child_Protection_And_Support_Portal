
import { api } from './api';

export const followUpService = {
    getWorkerFollowUps: (workerId: string) =>
        api.get(`/api/follow-ups/worker/${workerId}`),

    getMyFollowUps: () =>
        api.get('/api/follow-ups/my-schedule'), // Ensure backend endpoint matches

    createFollowUp: (data: any) =>
        api.post('/api/follow-ups', data),

    updateFollowUp: (id: string, data: any) =>
        api.put(`/api/follow-ups/${id}`, data),

    deleteFollowUp: (id: string) =>
        api.delete(`/api/follow-ups/${id}`)
};
