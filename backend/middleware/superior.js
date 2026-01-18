// Superior middleware: allows only users with the 'superior' role.
// Superiors have full management access per system policy.
module.exports = function(req, res, next) {
  const role = req.user?.role;
  if (!role) return res.status(401).json({ message: 'Unauthorized' });
  if (role !== 'superior') {
    return res.status(403).json({ message: 'Access denied. Superior only.' });
  }
  next();
};
