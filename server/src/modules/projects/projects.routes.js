const router = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const { list, getById, create, update, remove } = require('./projects.controller');
const tasksRoutes = require('../tasks/tasks.routes');

router.get('/', auth, list);
router.get('/:id', auth, getById);
router.post('/', auth, requireRole('PMO'), create);
router.put('/:id', auth, requireRole('PMO'), update);
router.delete('/:id', auth, requireRole('PMO'), remove);

router.use('/:projectId/tasks', (req, res, next) => {
  req.projectId = Number(req.params.projectId);
  next();
}, tasksRoutes);

module.exports = router;
