const express = require('express');
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', auth, loanController.requestLoan);
router.get('/all', auth, authorize.permitRoles('admin', 'superior'), loanController.getAllLoans);
router.get('/employee/:employeeId', auth, authorize.allowSelfOrRoles('employeeId', 'admin', 'superior'), loanController.getLoansByEmployee);
router.patch('/:id/approve', auth, authorize.permitRoles('superior'), loanController.approveLoan);
router.patch('/:id/reject', auth, authorize.permitRoles('superior'), loanController.rejectLoan);

module.exports = router;
