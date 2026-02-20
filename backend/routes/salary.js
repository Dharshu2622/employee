const express = require('express');
const salaryController = require('../controllers/salaryController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/structure', auth, authorize.permitRoles('admin', 'superior'), salaryController.setSalaryStructure);
// Salary generation and payroll tasks are handled strictly by the Superior role
router.post('/generate', auth, authorize.permitRoles('admin', 'superior'), salaryController.generateSalary);
router.post('/generate-all', auth, authorize.permitRoles('admin', 'superior'), salaryController.generateAllSalaries);
router.get('/all', auth, authorize.permitRoles('admin', 'superior'), salaryController.getAllSalaries);
router.get('/history/:employeeId', auth, authorize.allowSelfOrRoles('employeeId', 'admin', 'superior'), salaryController.getSalaryHistory);
router.get('/preview', auth, authorize.permitRoles('admin', 'superior'), salaryController.previewSalary);
router.get('/structure/:employeeId', auth, authorize.permitRoles('admin', 'superior'), salaryController.getSalaryStructure);

module.exports = router;
