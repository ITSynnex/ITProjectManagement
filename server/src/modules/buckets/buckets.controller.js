const bucketsService = require('./buckets.service');

const list   = (req, res) => res.json(bucketsService.listByPlan(Number(req.params.planId)));

const create = (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json(bucketsService.create(Number(req.params.planId), req.body.name));
};

const update = (req, res) => {
  const bucket = bucketsService.update(Number(req.params.id), req.body);
  if (!bucket) return res.status(404).json({ error: 'Bucket not found' });
  res.json(bucket);
};

const remove = (req, res) => {
  if (!bucketsService.remove(Number(req.params.id))) return res.status(404).json({ error: 'Bucket not found' });
  res.status(204).end();
};

module.exports = { list, create, update, remove };
