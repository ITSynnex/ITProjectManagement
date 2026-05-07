const router = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const { list, create, remove } = require('./users.controller');

router.get('/', auth, requireRole('it_manager', 'pmo'), list);
router.post('/', auth, requireRole('it_manager'), create);
router.delete('/:id', auth, requireRole('it_manager'), remove);

module.exports = router;
