const tasksService = require('./tasks.service');

const list = (req, res) =>
  res.json(tasksService.listByPlan(Number(req.params.planId), req.query));

const create = (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name is required' });
  const result = tasksService.create(Number(req.params.planId), req.body);
  if (result?.error) return res.status(result.status || 400).json({ error: result.error });
  res.status(201).json(result);
};

const update = (req, res) => {
  const result = tasksService.update(Number(req.params.id), req.body, req.user.role);
  if (result?.error) return res.status(result.status || 400).json({ error: result.error });
  res.json(result);
};

const toggleComplete = (req, res) => {
  const result = tasksService.toggleComplete(Number(req.params.id), req.user.role);
  if (result?.error) return res.status(result.status || 400).json({ error: result.error });
  res.json(result);
};

const remove = (req, res) => {
  const result = tasksService.remove(Number(req.params.id), req.user.role);
  if (result?.error) return res.status(result.status || 400).json({ error: result.error });
  res.status(204).end();
};

module.exports = { list, create, update, toggleComplete, remove };
