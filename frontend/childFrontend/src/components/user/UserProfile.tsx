import api from '../../services/api';

export interface ProfileUpdateData {
  fullName?: string;
  phone?: string;
  address?: string;
  profilePhoto?: string | null;
  policeInfo?: {
    badgeNumber?: string;
    department?: string;
    rank?: string;
    stationAddress?: string;
    specializations?: string[];
    yearsOfService?: number;
  };
  socialWorkerInfo?: {
    licenseNumber?: string;
    organization?: string;
    qualification?: string;
    yearsOfExperience?: number;
    specializations?: string[];
    accreditationStatus?: string;
  };
  notificationPreferences?: {
    emailUpdates?: boolean;
    smsUrgent?: boolean;
    pushNotifications?: boolean;
    weeklySummary?: boolean;
    promotionalEmails?: boolean;
  };
  privacySettings?: {
    showNamePublicly?: boolean;
    allowContact?: boolean;
    shareActivityStats?: boolean;
    participateInFeedback?: boolean;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: ProfileUpdateData) {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  async uploadProfilePhoto(formData: FormData, onProgress?: (progress: number) => void) {
    const response = await api.post('/user/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  async changePassword(data: PasswordChangeData) {
    const response = await api.post('/user/change-password', data);
    return response.data;
  },

  async toggleTwoFactor(enabled: boolean) {
    const response = await api.post('/user/two-factor', { enabled });
    return response.data;
  },

  async getLinkedDevices() {
    const response = await api.get('/user/devices');
    return response.data;
  },

  async removeDevice(deviceId: string) {
    const response = await api.delete(`/user/devices/${deviceId}`);
    return response.data;
  },

  async downloadUserData() {
    const response = await api.get('/user/export-data', {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/user/account');
    return response.data;
  },
};