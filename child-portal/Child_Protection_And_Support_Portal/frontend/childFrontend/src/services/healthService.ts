
import { api } from './api';

export const healthService = {

  checkHealth: () => 
    api.get('/api/health')
};

