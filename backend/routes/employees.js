const express = require('express');
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/', auth, authorize(['admin', 'superior']), employeeController.getAllEmployees);
router.get('/:id', auth, employeeController.getEmployeeById); // controller enforces access (self/admin/superior)
router.post('/', auth, authorize(['admin', 'superior']), employeeController.createEmployee);
router.put('/:id', auth, employeeController.updateEmployee); // superior, admin or the employee themself enforced in controller
router.delete('/:id', auth, authorize(['admin', 'superior']), employeeController.deleteEmployee);
router.get('/summary/demographics', auth, authorize(['admin', 'superior']), employeeController.getDemographicsSummary);

module.exports = router;
