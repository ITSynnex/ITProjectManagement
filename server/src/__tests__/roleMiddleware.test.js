const requireRole = require('../middleware/role.middleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('requireRole middleware — unit tests', () => {
  it('returns 401 when req.user is missing', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    requireRole('it_manager')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when role does not match', () => {
    const req = { user: { role: 'dev_operation' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('it_manager')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when role matches', () => {
    const req = { user: { role: 'it_manager' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('it_manager')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('allows any of multiple roles', () => {
    const next = jest.fn();
    const res  = mockRes();
    for (const role of ['it_manager', 'pmo']) {
      requireRole('it_manager','pmo')({ user: { role } }, res, next);
    }
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('blocks dev_operation from it_manager+pmo route', () => {
    const req = { user: { role: 'dev_operation' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('it_manager','pmo')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
