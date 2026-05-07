const plansService = require('./plans.service');

const list    = (req, res) => res.json(plansService.list());

const getById = (req, res) => {
  const plan = plansService.getById(Number(req.params.id));
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan);
};

const create  = (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json(plansService.create(req.body, req.user.id));
};

const update  = (req, res) => {
  const plan = plansService.update(Number(req.params.id), req.body);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  res.json(plan);
};

const remove  = (req, res) => {
  if (!plansService.remove(Number(req.params.id))) return res.status(404).json({ error: 'Plan not found' });
  res.status(204).end();
};

module.exports = { list, getById, create, update, remove };
