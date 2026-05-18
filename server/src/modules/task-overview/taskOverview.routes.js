const router = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const { getByTeam, getByDepartment, getByBucket } = require('./taskOverview.service');

router.get('/team', auth, (req, res, next) => {
  try { res.json(getByTeam()); } catch (e) { next(e); }
});

router.get('/department', auth, (req, res, next) => {
  try { res.json(getByDepartment()); } catch (e) { next(e); }
});

router.get('/bucket', auth, (req, res, next) => {
  try { res.json(getByBucket()); } catch (e) { next(e); }
});

module.exports = router;
