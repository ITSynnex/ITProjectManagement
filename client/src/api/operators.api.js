import api from './axios';
export const getOperators       = ()         => api.get('/operators');
export const getActiveOperators = ()         => api.get('/operators/active');
export const createOperator     = (data)     => api.post('/operators', data);
export const updateOperator     = (id, data) => api.put(`/operators/${id}`, data);
export const deleteOperator     = (id)       => api.delete(`/operators/${id}`);
