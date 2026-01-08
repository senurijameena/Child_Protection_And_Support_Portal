
import { api } from './api';

export const userService = {

  getUserProfile: (userId: string) => 
    api.get(`/api/user/profile/${userId}`),

  getUserStats: (userId: string) =>
    api.get(`/api/user/profile/${userId}/stats`),
  
  getUserPersonalAnalytics: (userId: string) =>
    api.get(`/api/user/profile/${userId}/analytics`),
  
  uploadProfilePhoto: (userId: string, formData: FormData) =>
    api.post(`/api/user/profile/${userId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  removeProfilePhoto: (userId: string) =>
    api.delete(`/api/user/profile/${userId}/photo`),
  
  updateUserProfile: (userId: string, data: any) =>
    api.put(`/api/user/profile/${userId}`, data)
};

