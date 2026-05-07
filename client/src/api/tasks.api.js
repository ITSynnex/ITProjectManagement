import api from './axios';
export const getTasks       = (planId, params) => api.get(`/plans/${planId}/tasks`, { params });
export const createTask     = (planId, data)   => api.post(`/plans/${planId}/tasks`, data);
export const updateTask     = (id, data)       => api.put(`/tasks/${id}`, data);
export const completeTask   = (id)             => api.patch(`/tasks/${id}/complete`);
export const deleteTask     = (id)             => api.delete(`/tasks/${id}`);
