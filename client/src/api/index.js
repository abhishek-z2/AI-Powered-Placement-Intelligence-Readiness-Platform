import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    timeout: 60000,
    withCredentials: true,
});

// Auth API
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
};

// Students API
export const studentsAPI = {
    uploadResume: (formData) => api.post('/students/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: () => api.get('/students'),
    getById: (id) => api.get(`/students/${id}`),
    getHistory: () => api.get('/students/my-history'),
    getDepartments: () => api.get('/students/departments'),
    getInterviewQuestions: (id) => api.post(`/students/${id}/interview-questions`),
};

// Recruiter API
export const recruiterAPI = {
    uploadJD: (data) => api.post('/recruiter/upload-jd', data),
    getRankings: (data) => api.post('/recruiter/rankings', data),
};

// Analytics API
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getPlacementTrends: () => api.get('/analytics/trends'),
    getSkillDemand: () => api.get('/analytics/skills-demand'),
};

export default api;
