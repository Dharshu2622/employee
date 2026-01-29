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
    const officialLeaves = attendanceRecords.filter(a => a.status === 'official_leave').length;

    // Calculate basic salary based on attendance
    const workingDays = 30; // Assuming 30 days month for simplicity
    const actualWorkedDays = presentDays + (halfDays * 0.5) + officialLeaves;
    const attendancePercentage = (actualWorkedDays / workingDays) * 100;
    const adjustedBaseSalary = Math.round((employee.baseSalary || 0) * (attendancePercentage / 100));

    // Default allowances and deductions
    const allowances = {
      hra: Math.round(adjustedBaseSalary * 0.10), // 10% HRA
      da: Math.round(adjustedBaseSalary * 0.05), // 5% DA
      travel: 500,
      medical: 500,
      other: 0
    };

    const deductions = {
      pf: Math.round(adjustedBaseSalary * 0.12), // 12% PF
      tax: Math.round(adjustedBaseSalary * 0.05), // 5% Tax
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

    // Trigger Payslip Generation and Email
    let emailStatus = 'Not sent';
    try {
      const payslipController = require('./payslipController');
      // We need a way to call generatePayslip logic here or refactor it
      // For now, let's just use the requirement to send email immediately.
      const path = require('path');
      const fs = require('fs');
      const { generatePayslipPDF } = require('../utils/pdfGenerator');
      const { sendPayslipEmail } = require('../utils/mailer');
      const Payslip = require('../models/Payslip');

      const payslipsDir = path.join(__dirname, '../payslips');
      if (!fs.existsSync(payslipsDir)) fs.mkdirSync(payslipsDir, { recursive: true });

      const pdfPath = path.join(payslipsDir, `Payslip_${employeeId}_${month}.pdf`);
      await generatePayslipPDF(employee, salary, month, pdfPath);

      const payslip = new Payslip({
        employee: employeeId,
        salary: salary._id,
        month,
        pdfPath
      });

      const success = await sendPayslipEmail(employee.email, employee.name, month, pdfPath);
      if (success) {
        payslip.emailSent = true;
        payslip.sentOn = new Date();
        emailStatus = 'Sent successfully';
      }
      await payslip.save();
    } catch (payslipErr) {
      console.error('Payslip processing error:', payslipErr);
      emailStatus = 'Error sending email: ' + payslipErr.message;
    }

    res.status(201).json({
      message: 'Salary processed and payslip generated successfully',
      salary,
      emailStatus,
      details: {
        attendanceDays: presentDays,
        leavesDays: leaveDays,
        halfDays,
        officialLeaves,
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
