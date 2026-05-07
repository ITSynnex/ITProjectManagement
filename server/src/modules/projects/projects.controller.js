const projectsService = require('./projects.service');

const list = (req, res) => res.json(projectsService.list());

const getById = (req, res) => {
  const project = projectsService.getById(Number(req.params.id));
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
};

const create = (req, res) => {
  const { title, priority } = req.body;
  if (!title || !priority) {
    return res.status(400).json({ error: 'title and priority are required' });
  }
  const project = projectsService.create(req.body, req.user.id);
  res.status(201).json(project);
};

const update = (req, res) => {
  const project = projectsService.update(Number(req.params.id), req.body);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
};

const remove = (req, res) => {
  const ok = projectsService.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Project not found' });
  res.json({ message: 'Project deleted' });
};

module.exports = { list, getById, create, update, remove };
