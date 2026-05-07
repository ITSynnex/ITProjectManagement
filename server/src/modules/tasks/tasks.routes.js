const router      = require('express').Router({ mergeParams: true });
const auth        = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const { list, create, update, toggleComplete, remove } = require('./tasks.controller');

// Nested under /api/plans/:planId/tasks
router.get('/',    auth, list);
router.post('/',   auth, requireRole('it_manager','pmo'), create);

// Standalone /api/tasks/:id
const standalone = require('express').Router();
standalone.put('/:id',             auth, requireRole('it_manager','pmo'), update);
standalone.patch('/:id/complete',  auth, requireRole('it_manager','pmo'), toggleComplete);
standalone.delete('/:id',          auth, requireRole('it_manager','pmo'), remove);

module.exports = { nested: router, standalone };
