
import { api } from './api';

export const scheduleService = {

  createSchedule: (offerId: string, scheduleData: any) => 
    api.post(`/api/services/${offerId}/schedule`, scheduleData),

  getSchedule: (offerId: string) => 
    api.get(`/api/services/${offerId}/schedule`),

  updateSchedule: (offerId: string, scheduleId: string, updates: any) => 
    api.put(`/api/services/${offerId}/schedule/${scheduleId}`, updates),

  getUpcomingServices: (params: any = {}) => 
    api.get('/api/services/upcoming', { params }),

  getServiceCalendar: (month: number, year: number) => 
    api.get(`/api/services/calendar/${year}/${month}`)
};

