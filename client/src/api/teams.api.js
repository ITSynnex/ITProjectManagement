import api from './axios';
export const getTeams       = ()         => api.get('/teams');
export const getActiveTeams = ()         => api.get('/teams/active');
export const createTeam     = (data)     => api.post('/teams', data);
export const updateTeam     = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam     = (id)       => api.delete(`/teams/${id}`);
