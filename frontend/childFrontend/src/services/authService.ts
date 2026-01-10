
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserData;
}

export const UserRole = {
  ADMIN: 'ADMIN' as const,
  POLICE: 'POLICE' as const,
  SOCIAL_WORKER: 'SOCIAL_WORKER' as const,
  PUBLIC: 'PUBLIC' as const
} as const;

export type UserRole = 'ADMIN' | 'POLICE' | 'SOCIAL_WORKER' | 'PUBLIC';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  profileImage?: string;
  badgeNumber?: string;
  licenseNumber?: string;
  department?: string;
  createdAt: string;
  phone?: string;
  address?: string;
}

const mapBackendRoleToFrontend = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'PU': 'PUBLIC',
    'PO': 'POLICE',
    'SW': 'SOCIAL_WORKER',
    'ADMIN': 'ADMIN',

    'PUBLIC': 'PUBLIC',
    'POLICE': 'POLICE',
    'SOCIAL_WORKER': 'SOCIAL_WORKER'
  };

  return roleMap[backendRole?.toUpperCase()] || 'PUBLIC';
};

export const authService = {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Login request:', { email: credentials.email });
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);
      console.log('Raw Role from backend:', response.data.role);
      const mappedRole = mapBackendRoleToFrontend(response.data.role || 'PU');
      console.log('Mapped Role:', mappedRole);

      // Check if login was successful - backend returns approved=true and token when successful
      if (response.data && response.data.approved === true && response.data.token) {
        if (!response.data.token || response.data.token.trim() === '') {
          console.error('Empty token received');
          return {
            success: false,
            message: 'Invalid token received from server'
          };
        }

        localStorage.setItem('authToken', response.data.token);

        const userData: UserData = {
          id: response.data.userId || '',
          email: response.data.email || '',
          name: response.data.fullName || response.data.name || '',
          role: mapBackendRoleToFrontend(response.data.role || 'PU'),
          status: response.data.approved ? 'ACTIVE' : 'PENDING',
          profileImage: response.data.profilePhoto || response.data.profileImage,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.role === 'POLICE' && response.data.badgeNumber) {
          localStorage.setItem('badgeNumber', response.data.badgeNumber);
        }
        if (userData.role === 'SOCIAL_WORKER' && response.data.licenseNumber) {
          localStorage.setItem('licenseNumber', response.data.licenseNumber);
        }

        return {
          success: true,
          token: response.data.token,
          user: userData,
          message: response.data.message || 'Login successful'
        };
      }

      // Handle failed login - backend returns approved=false with a message
      const errorMessage = response.data?.message || 'Login failed. Please check your credentials.';
      console.error('Login failed:', errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle network errors or HTTP errors
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      if (error.response?.status === 400 || error.response?.status === 401) {
        return {
          success: false,
          message: error.response?.data?.message || 'Invalid credentials. Please check your email and password.'
        };
      }
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        return {
          success: false,
          message: 'Unable to connect to server. Please check if the backend is running.'
        };
      }
      return {
        success: false,
        message: error.message || 'Login failed. Please check your credentials.'
      };
    }
  },


  async registerPoliceOfficer(requestData: any): Promise<AuthResponse> {
    try {
      // Backend expects JSON, not FormData
      const response = await axios.post(`${API_BASE_URL}/api/auth/register/police`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.approved === true && response.data.token) {
        localStorage.setItem('authToken', response.data.token);

        const userData: UserData = {
          id: response.data.userId,
          email: response.data.email,
          role: mapBackendRoleToFrontend(response.data.role || 'PO'),
          name: requestData.fullName || '',
          status: 'ACTIVE' as const,
          badgeNumber: requestData.badgeNumber || '',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.badgeNumber) {
          localStorage.setItem('badgeNumber', userData.badgeNumber);
        }
        return {
          success: true,
          token: response.data.token,
          user: userData,
          message: response.data.message || 'Registration successful'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Registration failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Police officer registration failed'
      };
    }
  },

  async registerSocialWorker(requestData: any): Promise<AuthResponse> {
    try {
      // Backend expects JSON, not FormData
      const response = await axios.post(`${API_BASE_URL}/api/auth/register/social-worker`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.approved === true && response.data.token) {
        localStorage.setItem('authToken', response.data.token);

        const userData: UserData = {
          id: response.data.userId,
          email: response.data.email,
          role: mapBackendRoleToFrontend(response.data.role || 'SW'),
          name: requestData.fullName || '',
          status: 'ACTIVE' as const,
          licenseNumber: requestData.licenseNumber || '',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.licenseNumber) {
          localStorage.setItem('licenseNumber', userData.licenseNumber);
        }
        return {
          success: true,
          token: response.data.token,
          user: userData,
          message: response.data.message || 'Registration successful'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Registration failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Social worker registration failed'
      };
    }
  },

  async registerPublicUser(requestData: any): Promise<AuthResponse> {
    try {
      // Backend expects JSON, not FormData
      const response = await axios.post(`${API_BASE_URL}/api/auth/register/public`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.approved === true && response.data.token) {
        localStorage.setItem('authToken', response.data.token);

        const userData: UserData = {
          id: response.data.userId,
          email: response.data.email,
          role: mapBackendRoleToFrontend(response.data.role || 'PU'),
          name: requestData.fullName || '',
          status: 'ACTIVE' as const,
          phone: requestData.phone || '',
          address: requestData.address || '',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return {
          success: true,
          token: response.data.token,
          user: userData,
          message: response.data.message || 'Registration successful'
        };
      }

      return {
        success: false,
        message: response.data.message || 'Registration failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Public user registration failed'
      };
    }
  },

  getCurrentUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('badgeNumber');
    localStorage.removeItem('licenseNumber');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') && !!this.getCurrentUser();
  },

  isUserActive(): boolean {
    const user = this.getCurrentUser();
    return user ? user.status === 'ACTIVE' : false;
  },

  getDashboardPath(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';

    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'POLICE':
        return '/dashboard';
      case 'SOCIAL_WORKER':
        return '/social-worker/dashboard';
      case 'PUBLIC':
        return '/public/dashboard';
      default:
        return '/dashboard';
    }
  },

  getRoleGreeting(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Welcome';

    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    switch (user.role) {
      case 'ADMIN':
        return `${greeting}, Administrator`;
      case 'POLICE':
        return `${greeting}, Officer ${user.name?.split(' ')[0] || ''}`;
      case 'SOCIAL_WORKER':
        return `${greeting}, Social Worker ${user.name?.split(' ')[0] || ''}`;
      default:
        return `${greeting}, ${user.name?.split(' ')[0] || 'User'}`;
    }
  },


  async updateProfile(profileData: Partial<UserData>): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const response = await api.put('/api/auth/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const response = await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password'
      };
    }
  },

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/request-password-reset', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to request password reset'
      };
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  }
};