import axios from 'axios';
import { auth } from '../config/firebase';

// Set to true to use mock data instead of real backend during development
export const USE_MOCK = false;

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(async (config) => {
    if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;
