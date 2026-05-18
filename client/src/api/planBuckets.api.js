import api from './axios';

export const getPlanBuckets       = () => api.get('/plan-buckets');
export const getActivePlanBuckets = () => api.get('/plan-buckets/active');
export const createPlanBucket     = (data) => api.post('/plan-buckets', data);
export const updatePlanBucket     = (id, data) => api.put(`/plan-buckets/${id}`, data);
export const deletePlanBucket     = (id) => api.delete(`/plan-buckets/${id}`);
