const express = require('express');
const payslipController = require('../controllers/payslipController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Generate payslip: superior (payroll) only
router.post('/generate', auth, authorize.permitRoles('superior'), payslipController.generatePayslip);
router.get('/all', auth, authorize.permitRoles('admin', 'superior'), payslipController.getAllPayslips);
router.get('/:id/download', auth, authorize.allowPayslipOwnerOrRoles('id', 'admin', 'superior'), payslipController.downloadPayslip);
router.post('/:id/send-email', auth, authorize.permitRoles('superior'), payslipController.sendPayslipEmail);
router.get('/employee/:employeeId', auth, authorize.allowSelfOrRoles('employeeId', 'admin', 'superior'), payslipController.getPayslipsByEmployee);

module.exports = router;
