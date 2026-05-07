const authService = require('./auth.service');

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const result = authService.login(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json(result);
};

const me = (req, res) => {
  const user = authService.getById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

module.exports = { login, me };
