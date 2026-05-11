import api from './axios';

export const getPlanStatuses       = ()         => api.get('/plan-statuses');
export const getActivePlanStatuses = ()         => api.get('/plan-statuses/active');
export const createPlanStatus      = (data)     => api.post('/plan-statuses', data);
export const updatePlanStatus      = (id, data) => api.put(`/plan-statuses/${id}`, data);
export const deletePlanStatus      = (id)       => api.delete(`/plan-statuses/${id}`);
