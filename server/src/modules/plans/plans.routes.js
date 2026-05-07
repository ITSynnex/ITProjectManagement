const router      = require('express').Router();
const auth        = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const { list, listGantt, getById, create, update, remove } = require('./plans.controller');

router.get('/',       auth, list);
router.get('/gantt',  auth, listGantt);
router.get('/:id',    auth, getById);
router.post('/',   auth, requireRole('it_manager','pmo'), create);
router.put('/:id', auth, requireRole('it_manager','pmo'), update);
router.delete('/:id', auth, requireRole('it_manager','pmo'), remove);

module.exports = router;
