const router = require('express').Router();
const auth = require('../../middleware/auth.middleware');
const { login, me } = require('./auth.controller');

router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;
