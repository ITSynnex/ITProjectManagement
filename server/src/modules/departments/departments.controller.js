const svc = require('./departments.service');

const list      = (req, res) => res.json(svc.list());
const listActive = (req, res) => res.json(svc.listActive());

const create = (req, res) => {
  const result = svc.create(req.body);
  if (result.error) return res.status(result.status || 400).json({ error: result.error });
  res.status(201).json(result);
};

const update = (req, res) => {
  const result = svc.update(Number(req.params.id), req.body);
  if (result.error) return res.status(result.status || 400).json({ error: result.error });
  res.json(result);
};

const remove = (req, res) => {
  const result = svc.remove(Number(req.params.id));
  if (result.error) return res.status(result.status || 400).json({ error: result.error });
  res.json({ message: 'Department deleted' });
};

module.exports = { list, listActive, create, update, remove };
