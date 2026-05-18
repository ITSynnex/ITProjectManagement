const router = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/role.middleware');
const svc = require('./planBuckets.service');

const mgr = requireRole('it_manager', 'pmo');

router.get('/', auth, (req, res, next) => {
  try { res.json(svc.list()); } catch (e) { next(e); }
});

router.get('/active', auth, (req, res, next) => {
  try { res.json(svc.getActive()); } catch (e) { next(e); }
});

router.post('/', auth, mgr, (req, res, next) => {
  try {
    const result = svc.create(req.body);
    if (result?.error) return res.status(400).json({ error: result.error });
    res.status(201).json(result);
  } catch (e) { next(e); }
});

router.put('/:id', auth, mgr, (req, res, next) => {
  try {
    const result = svc.update(Number(req.params.id), req.body);
    if (result?.error) return res.status(result.status || 400).json({ error: result.error });
    res.json(result);
  } catch (e) { next(e); }
});

router.delete('/:id', auth, mgr, (req, res, next) => {
  try {
    const result = svc.remove(Number(req.params.id));
    if (result?.error) return res.status(result.status || 400).json({ error: result.error });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
