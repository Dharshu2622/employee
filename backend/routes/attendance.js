const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Marking/editing attendance is an operational task for Superior (HR / Manager)
// Marking/editing attendance is an operational task for Superior (HR / Manager)
router.post('/', auth, authorize.permitRoles('superior', 'admin'), attendanceController.markAttendance);
router.get('/all', auth, authorize.permitRoles('admin', 'superior'), attendanceController.getAllAttendance);
router.get('/employee/:employeeId', auth, authorize.allowSelfOrRoles('employeeId', 'admin', 'superior'), attendanceController.getAttendanceByEmployee);
router.get('/month', auth, authorize.permitRoles('superior'), attendanceController.getAttendanceByMonth);
router.get('/by-date', auth, authorize.permitRoles('admin', 'superior'), attendanceController.getAttendanceByDate);
router.get('/summary/today', auth, authorize.permitRoles('admin', 'superior'), attendanceController.getAttendanceSummaryToday); // Kept for backward compatibility
router.get('/summary', auth, authorize.permitRoles('admin', 'superior'), attendanceController.getAttendanceSummaryToday);

module.exports = router;
