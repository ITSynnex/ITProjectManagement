import api from './axios';

export const getTaskOverviewByTeam       = () => api.get('/task-overview/team');
export const getTaskOverviewByDepartment = () => api.get('/task-overview/department');
export const getTaskOverviewByBucket     = () => api.get('/task-overview/bucket');
