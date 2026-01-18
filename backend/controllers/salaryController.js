const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Loan = require('../models/Loan');

// Create/Update salary structure
exports.setSalaryStructure = async (req, res) => {
  try {
    const { employeeId, baseSalary, allowances, deductions } = req.body;

    // Calculate totals
    const allowanceTotal = Object.values(allowances || {}).reduce((a, b) => a + b, 0);
    const deductionTotal = Object.values(deductions || {}).reduce((a, b) => a + b, 0);
    const gross = baseSalary + allowanceTotal;
    const net = gross - deductionTotal;

    // Update employee base salary
    await Employee.findByIdAndUpdate(employeeId, { baseSalary });

    res.json({
      message: 'Salary structure set successfully',
      gross,
      net,
      totalDeductions: deductionTotal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate salary for an employee for a specific month
exports.generateSalary = async (req, res) => {
  try {
    const { employeeId, month } = req.body; // month format: YYYY-MM

    // Fetch employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if salary already exists for this month
    const existingSalary = await Salary.findOne({ employee: employeeId, month });
    if (existingSalary) {
      return res.status(400).json({ message: 'Salary already generated for this month' });
    }

    // Get attendance for the month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
    const leaveDays = attendanceRecords.filter(a => a.status === 'leave').length;
    const halfDays = attendanceRecords.filter(a => a.status === 'halfday').length;

    // Calculate basic salary based on attendance
    const workingDays = 26; // Assuming 26 working days per month
    const actualWorkedDays = presentDays + (halfDays * 0.5);
    const attendancePercentage = (actualWorkedDays / workingDays) * 100;
    const adjustedBaseSalary = (employee.baseSalary || 0) * (attendancePercentage / 100);

    // Default allowances and deductions
    const allowances = {
      hra: adjustedBaseSalary * 0.10, // 10% HRA
      da: adjustedBaseSalary * 0.05, // 5% DA
      travel: 500,
      medical: 500,
      other: 0
    };

    const deductions = {
      pf: adjustedBaseSalary * 0.12, // 12% PF
      tax: adjustedBaseSalary * 0.05, // 5% Tax
      insurance: 500,
      loanEMI: 0,
      leaveDeduction: 0
    };

    // Add loan EMI if employee has approved loans
    const approvedLoans = await Loan.find({ employee: employeeId, status: 'approved' });
    const totalEMI = approvedLoans.reduce((sum, loan) => sum + (loan.monthlyEMI || 0), 0);
    deductions.loanEMI = totalEMI;

    // Calculate totals
    const allowanceTotal = Object.values(allowances).reduce((a, b) => a + b, 0);
    const deductionTotal = Object.values(deductions).reduce((a, b) => a + b, 0);
    const gross = adjustedBaseSalary + allowanceTotal;
    const net = gross - deductionTotal;

    // Create salary record
    const salary = new Salary({
      employee: employeeId,
      month,
      basicSalary: adjustedBaseSalary,
      allowances,
      deductions,
      gross,
      totalDeductions: deductionTotal,
      net,
      attendanceDays: presentDays,
      leavesTaken: leaveDays
    });

    await salary.save();

    res.status(201).json({
      message: 'Salary generated successfully',
      salary,
      details: {
        attendanceDays: presentDays,
        leavesDays: leaveDays,
        halfDays,
        attendancePercentage: attendancePercentage.toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get salary history for employee
exports.getSalaryHistory = async (req, res) => {
  try {
    const salaries = await Salary.find({ employee: req.params.employeeId })
      .populate('employee', 'name email department')
      .sort({ month: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all salaries
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employee', 'name email department')
      .sort({ month: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
