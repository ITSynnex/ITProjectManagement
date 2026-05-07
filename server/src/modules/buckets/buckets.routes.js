const router      = require('express').Router({ mergeParams: true });
const auth        = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const { list, create, update, remove } = require('./buckets.controller');

router.get('/',    auth, list);
router.post('/',   auth, requireRole('it_manager','pmo'), create);
router.put('/:id', auth, requireRole('it_manager','pmo'), update);
router.delete('/:id', auth, requireRole('it_manager','pmo'), remove);

module.exports = router;
