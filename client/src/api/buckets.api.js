import api from './axios';
export const getBuckets    = (planId)       => api.get(`/plans/${planId}/buckets`);
export const createBucket  = (planId, data) => api.post(`/plans/${planId}/buckets`, data);
export const updateBucket  = (planId, id, data) => api.put(`/plans/${planId}/buckets/${id}`, data);
export const deleteBucket  = (planId, id)   => api.delete(`/plans/${planId}/buckets/${id}`);
