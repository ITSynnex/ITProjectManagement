const usersService = require('./users.service');

const list = (req, res) => res.json(usersService.list());

const create = (req, res) => {
  const { email, display_name, password, role, avatar_url } = req.body;
  if (!email || !display_name || !password || !role)
    return res.status(400).json({ error: 'email, display_name, password, and role are required' });
  const result = usersService.create(email, display_name, password, role, avatar_url);
  if (result.error) return res.status(409).json({ error: result.error });
  res.status(201).json(result);
};

const remove = (req, res) => {
  const result = usersService.remove(Number(req.params.id));
  if (result.error) return res.status(result.status || 400).json({ error: result.error });
  res.json({ message: 'User deleted' });
};

module.exports = { list, create, remove };
