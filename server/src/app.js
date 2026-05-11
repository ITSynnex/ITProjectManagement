require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes        = require('./modules/auth/auth.routes');
const usersRoutes       = require('./modules/users/users.routes');
const operatorsRoutes   = require('./modules/operators/operators.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const teamsRoutes         = require('./modules/teams/teams.routes');
const planStatusesRoutes  = require('./modules/plan-statuses/planStatuses.routes');
const plansRoutes         = require('./modules/plans/plans.routes');
const bucketsRouter     = require('./modules/buckets/buckets.routes');
const tasksRoutes       = require('./modules/tasks/tasks.routes');
const errorHandler      = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth',        authRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/operators',   operatorsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/teams',          teamsRoutes);
app.use('/api/plan-statuses',  planStatusesRoutes);
app.use('/api/plans',          plansRoutes);

// Nested routes: /api/plans/:planId/buckets and /api/plans/:planId/tasks
const plansNested = require('express').Router({ mergeParams: true });
plansNested.use('/:planId/buckets', bucketsRouter);
plansNested.use('/:planId/tasks',   tasksRoutes.nested);
app.use('/api/plans', plansNested);

// Standalone task routes: /api/tasks/:id
app.use('/api/tasks', tasksRoutes.standalone);

// Return 404 JSON for unmatched /api/* routes so they don't fall through to the SPA
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve built frontend and handle React Router paths
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.get('/{*path}', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.use(errorHandler);

module.exports = app;
