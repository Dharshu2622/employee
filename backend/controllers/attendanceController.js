const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employee, date, status, checkInTime, checkOutTime, remarks } = req.body;

    const targetEmployee = await Employee.findById(employee);
    if (!targetEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.user.role === 'admin') {
      if (targetEmployee.role !== 'superior') {
        return res.status(403).json({ message: 'Admins can only mark attendance for Superiors.' });
      }
    } else if (req.user.role === 'superior') {
      if (targetEmployee.role !== 'employee') {
        return res.status(403).json({ message: 'Superiors can only mark attendance for Employees.' });
      }
    }

    const attendance = new Attendance({
      employee,
      date: new Date(date),
      status,
      checkInTime,
      checkOutTime,
      remarks
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('employee', 'name email department')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance by employee
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const attendance = await Attendance.find({ employee: req.params.employeeId })
      .populate('employee', 'name email department')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance by month
exports.getAttendanceByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lt: endDate }
    }).populate('employee', 'name email department');

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance summary for today
exports.getAttendanceSummaryToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const summaries = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const result = {
      totalEmployees,
      present: 0,
      absent: 0,
      leave: 0,
      halfday: 0,
      official_leave: 0
    };

    summaries.forEach(s => {
      if (s._id in result) {
        result[s._id] = s.count;
      }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
