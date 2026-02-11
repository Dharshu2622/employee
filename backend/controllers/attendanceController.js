const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Mark attendance (Upsert: Create or Update)
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

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0); // Normalize time

    const attendance = await Attendance.findOneAndUpdate(
      { employee, date: attendanceDate },
      {
        status,
        checkInTime,
        checkOutTime,
        remarks,
        employee, // Ensure employee field is set on insert
        date: attendanceDate // Ensure date is set on insert
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: 'Attendance updated successfully', attendance });
  } catch (err) {
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

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(queryDate);
    nextDay.setDate(queryDate.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: queryDate, $lt: nextDay }
    }).populate('employee', 'name email department role');

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

// Get attendance summary (Today or Specific Date)
// Get attendance summary (Today or Specific Date)
exports.getAttendanceSummaryToday = async (req, res) => {
  try {
    let queryDate = new Date();
    if (req.query.date) {
      queryDate = new Date(req.query.date);
    }
    queryDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(queryDate);
    nextDay.setDate(queryDate.getDate() + 1);

    const summaries = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: queryDate, $lt: nextDay }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      {
        $unwind: '$employeeDetails'
      },
      {
        $match: {
          'employeeDetails.role': 'employee'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count only active employees with role 'employee'
    const totalEmployees = await Employee.countDocuments({ role: 'employee', status: 'active' });

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
