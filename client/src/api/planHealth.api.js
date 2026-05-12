import api from './axios';

export const getPlanHealth        = ()         => api.get('/plan-health');
export const getActivePlanHealth  = ()         => api.get('/plan-health/active');
export const createPlanHealth     = (data)     => api.post('/plan-health', data);
export const updatePlanHealth     = (id, data) => api.put(`/plan-health/${id}`, data);
export const deletePlanHealth     = (id)       => api.delete(`/plan-health/${id}`);
