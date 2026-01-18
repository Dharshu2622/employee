const Payslip = require('../models/Payslip');

// Generic role-based authorization middleware factory
function authorize(allowedRoles = []) {
  return function(req, res, next) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const role = req.user.role;
    if (allowedRoles.includes(role)) return next();
    return res.status(403).json({ message: 'Access denied' });
  };
}

// Permit only specified roles (helper)
function permitRoles(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Allow access if the logged-in user is the same as the :param (self) OR if user's role is in allowedRoles
function allowSelfOrRoles(paramName, ...allowedRoles) {
  return async (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: 'Unauthorized' });

    if (allowedRoles.includes(role)) return next();

    const paramVal = req.params[paramName];
    if (!paramVal) return res.status(400).json({ message: 'Missing identifier' });

    if (String(req.user.id) === String(paramVal)) return next();

    return res.status(403).json({ message: 'Access denied' });
  };
}

// For payslip download/send actions where route has payslip id, allow if owner or allowedRoles
function allowPayslipOwnerOrRoles(paramName, ...allowedRoles) {
  return async (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: 'Unauthorized' });
    if (allowedRoles.includes(role)) return next();

    try {
      const payslip = await Payslip.findById(req.params[paramName]);
      if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
      if (String(payslip.employee) === String(req.user.id)) return next();
      return res.status(403).json({ message: 'Access denied' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

// Export main factory and attach helpers for backwards compatibility
module.exports = authorize;
module.exports.permitRoles = permitRoles;
module.exports.allowSelfOrRoles = allowSelfOrRoles;
module.exports.allowPayslipOwnerOrRoles = allowPayslipOwnerOrRoles;
