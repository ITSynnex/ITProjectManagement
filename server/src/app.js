require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes        = require('./modules/auth/auth.routes');
const usersRoutes       = require('./modules/users/users.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const plansRoutes       = require('./modules/plans/plans.routes');
const bucketsRouter     = require('./modules/buckets/buckets.routes');
const tasksRoutes       = require('./modules/tasks/tasks.routes');
const errorHandler      = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/plans',       plansRoutes);

// Nested routes: /api/plans/:planId/buckets and /api/plans/:planId/tasks
const plansNested = require('express').Router({ mergeParams: true });
plansNested.use('/:planId/buckets', bucketsRouter);
plansNested.use('/:planId/tasks',   tasksRoutes.nested);
app.use('/api/plans', plansNested);

// Standalone task routes: /api/tasks/:id
app.use('/api/tasks', tasksRoutes.standalone);

app.use(errorHandler);

module.exports = app;
