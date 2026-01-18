// Admin middleware: allows only users with the 'admin' role.
// Admins have read-only/monitoring access per system policy.
module.exports = function(req, res, next) {
  const role = req.user?.role;
  if (!role) return res.status(401).json({ message: 'Unauthorized' });
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};
