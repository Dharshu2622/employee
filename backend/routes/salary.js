const express = require('express');
const salaryController = require('../controllers/salaryController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/structure', auth, authorize.permitRoles('superior'), salaryController.setSalaryStructure);
// Salary generation and payroll tasks are handled by Superior role (HR / Payroll Officer)
router.post('/generate', auth, authorize.permitRoles('superior'), salaryController.generateSalary);
router.get('/all', auth, authorize.permitRoles('admin', 'superior'), salaryController.getAllSalaries);
router.get('/history/:employeeId', auth, authorize.allowSelfOrRoles('employeeId', 'admin', 'superior'), salaryController.getSalaryHistory);

module.exports = router;
