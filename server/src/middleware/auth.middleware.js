const { verify } = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = header.slice(7);
    req.user = verify(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
