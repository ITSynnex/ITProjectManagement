const router = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const { list, listActive, create, update, remove } = require('./teams.controller');

router.get('/',        auth, list);
router.get('/active',  auth, listActive);
router.post('/',       auth, requireRole('it_manager', 'pmo'), create);
router.put('/:id',     auth, requireRole('it_manager', 'pmo'), update);
router.delete('/:id',  auth, requireRole('it_manager', 'pmo'), remove);

module.exports = router;
