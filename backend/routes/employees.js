const express = require('express');
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/', auth, authorize(['admin', 'superior']), employeeController.getAllEmployees);
router.get('/:id', auth, employeeController.getEmployeeById); // controller enforces access (self/admin/superior)
router.post('/', auth, authorize(['superior']), employeeController.createEmployee);
router.put('/:id', auth, employeeController.updateEmployee); // superior or the employee themself enforced in controller
router.delete('/:id', auth, authorize(['superior']), employeeController.deleteEmployee);

module.exports = router;
