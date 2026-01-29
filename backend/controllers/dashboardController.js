const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Loan = require('../models/Loan');

exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Employee Stats
        const totalEmployees = await Employee.countDocuments({ role: { $ne: 'admin' } });
        const maleCount = await Employee.countDocuments({ role: { $ne: 'admin' }, gender: 'male' });
        const femaleCount = await Employee.countDocuments({ role: { $ne: 'admin' }, gender: 'female' });

        // 2. Attendance Stats (Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const attendanceStats = await Attendance.aggregate([
            { $match: { date: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const attendance = {
            present: 0,
            absent: 0,
            halfDay: 0,
            leave: 0,
            official_leave: 0
        };

        attendanceStats.forEach(stat => {
            if (stat._id === 'halfday') attendance.halfDay = stat.count; // normalizing key
            else if (attendance.hasOwnProperty(stat._id)) attendance[stat._id] = stat.count;
            else if (stat._id === 'official_leave') attendance.official_leave = stat.count;
        });

        // 3. Requests Stats
        const totalLeaveRequests = await Leave.countDocuments();
        const totalLoanRequests = await Loan.countDocuments();

        res.json({
            employees: {
                total: totalEmployees,
                male: maleCount,
                female: femaleCount
            },
            attendance,
            requests: {
                leaves: totalLeaveRequests,
                loans: totalLoanRequests
            }
        });

    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ message: 'Server Error fetching dashboard stats' });
    }
};
