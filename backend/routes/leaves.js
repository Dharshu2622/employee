const express = require('express');
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post('/', auth, leaveController.requestLeave);
router.get('/all', auth, authorize.permitRoles('admin', 'superior'), leaveController.getAllLeaves);
router.get('/employee/:employeeId', auth, authorize.allowSelfOrRoles('employeeId', 'admin', 'superior'), leaveController.getLeavesByEmployee);
router.patch('/:id/approve', auth, authorize.permitRoles('admin', 'superior'), leaveController.approveLeave);
router.patch('/:id/reject', auth, authorize.permitRoles('admin', 'superior'), leaveController.rejectLeave);
router.get('/pending/count', auth, authorize.permitRoles('admin', 'superior'), leaveController.getPendingRequestsCount);

module.exports = router;
