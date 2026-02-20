const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Loan = require('../models/Loan');
const Settings = require('../models/Settings');
const path = require('path');
const fs = require('fs');
const { generatePayslipPDF } = require('../utils/pdfGenerator');
const { sendPayslipEmail } = require('../utils/mailer');
const Payslip = require('../models/Payslip');
const Leave = require('../models/Leave');

// Create/Update salary structure
exports.setSalaryStructure = async (req, res) => {
  try {
    const { employeeId, baseSalary, allowances, deductions, month } = req.body;

    // Update employee salary structure
    await Employee.findByIdAndUpdate(employeeId, {
      baseSalary,
      allowances,
      deductions
    });

    // Sync with existing salary record if month is provided and record exists
    const syncMonth = month || new Date().toISOString().slice(0, 7);
    const existingSalary = await Salary.findOne({ employee: employeeId, month: syncMonth });

    if (existingSalary) {
      // Re-calculate and update if already finalized for this month
      await internalProcessSalary(employeeId, syncMonth);
    }

    const allowanceTotal = Object.values(allowances || {}).reduce((a, b) => a + b, 0);
    const deductionTotal = Object.values(deductions || {}).reduce((a, b) => a + b, 0);
    const gross = (baseSalary || 0) + allowanceTotal;
    const net = gross - deductionTotal;

    res.json({
      message: 'Financial structure archived and synchronized successfully',
      gross,
      net,
      totalDeductions: deductionTotal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get salary structure for an employee
exports.getSalaryStructure = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // If employee already has a custom structure, return it
    if (employee.baseSalary > 0 && employee.allowances && Object.keys(employee.allowances).length > 0) {
      return res.json({
        baseSalary: employee.baseSalary,
        allowances: employee.allowances,
        deductions: employee.deductions
      });
    }

    // Otherwise return defaults based on settings
    const settings = await Settings.findOne() || { payroll: { hraPercent: 20, professionalTax: 200, pfEmployerPercent: 12 } };
    const base = employee.baseSalary || 0;

    res.json({
      baseSalary: base,
      allowances: {
        hra: Math.round(base * (settings.payroll.hraPercent / 100)),
        da: Math.round(base * 0.10),
        travel: 1500,
        medical: 1250
      },
      deductions: {
        pf: Math.round(base * (settings.payroll.pfEmployerPercent / 100)),
        tax: Math.round(base * 0.05),
        insurance: 500
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @function calculateSalaryDetails
 * @description Pure logic to calculate salary components for an employee in a given month.
 * Does NOT save to database.
 */
const calculateSalaryDetails = async (employeeId, month) => {
  const [employee, settings] = await Promise.all([
    Employee.findById(employeeId),
    Settings.findOne()
  ]);

  if (!employee) throw new Error('Employee not found');
  const payrollSettings = settings?.payroll || { hraPercent: 20, pfEmployerPercent: 12, professionalTax: 200 };

  // 1. Parse Month & Get Boundaries (Local Time to match Attendance marking logic)
  const [year, m] = month.split('-').map(Number);
  const startDate = new Date(year, m - 1, 1);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(year, m, 0); // Last day of previous month... wait
  // Correct logic for last day of current month:
  const lastDay = new Date(year, m, 0);
  lastDay.setHours(23, 59, 59, 999);

  const totalDaysInMonth = lastDay.getDate();

  // 2. Fetch Data (Attendance, Loans, Approved Leaves)
  const [attendanceRecords, approvedLoans, approvedLeaves] = await Promise.all([
    Attendance.find({ employee: employeeId, date: { $gte: startDate, $lte: lastDay } }),
    Loan.find({ employee: employeeId, status: 'approved' }),
    Leave.find({ employee: employeeId, status: 'approved', fromDate: { $lte: lastDay }, toDate: { $gte: startDate } })
  ]);

  // 3. Count Attendance Metrics
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const officialLeaveCount = attendanceRecords.filter(a => a.status === 'official_leave').length;
  const halfDayCount = attendanceRecords.filter(a => a.status === 'halfday').length;
  const attendanceLeaveCount = attendanceRecords.filter(a => a.status === 'leave').length;

  const base = employee.baseSalary || 0;

  // 4. Calculate Allowances (Use custom > 0 if exists, else defaults)
  const allowances = {
    hra: (employee.allowances?.hra > 0) ? employee.allowances.hra : Math.round(base * (payrollSettings.hraPercent / 100)),
    da: (employee.allowances?.da > 0) ? employee.allowances.da : Math.round(base * 0.10),
    travel: (employee.allowances?.travel > 0) ? employee.allowances.travel : 1500,
    medical: (employee.allowances?.medical > 0) ? employee.allowances.medical : 1250,
    other: (employee.allowances?.other || 0)
  };
  const grossEarnings = base + Object.values(allowances).reduce((a, b) => a + b, 0);

  // 5. Advanced Leave / LOP Calculation
  let lopDays = 0;
  lopDays += halfDayCount * 0.5;

  for (const record of attendanceRecords) {
    if (record.status === 'leave' || record.status === 'absent') {
      const isPaidLeave = approvedLeaves.some(l =>
        l.type !== 'unpaid' &&
        record.date >= l.fromDate &&
        record.date <= l.toDate
      );
      if (!isPaidLeave) {
        lopDays += 1;
      }
    }
  }

  const dailyRate = grossEarnings / totalDaysInMonth;
  const leaveDeduction = 0; // Disabled as requested

  // 6. Deductions (Use custom > 0 if exists, else defaults)
  const deductions = {
    pf: (employee.deductions?.pf > 0) ? employee.deductions.pf : Math.round(base * (payrollSettings.pfEmployerPercent / 100)),
    tax: (employee.deductions?.tax > 0) ? employee.deductions.tax : Math.round(base * 0.05),
    insurance: (employee.deductions?.insurance > 0) ? employee.deductions.insurance : 500,
    loanEMI: 0,
    leaveDeduction: leaveDeduction
  };

  // 7. Loan EMI Logic
  deductions.loanEMI = approvedLoans.reduce((sum, loan) => {
    const remaining = loan.amount - (loan.paidAmount || 0);
    const emi = Math.min(loan.monthlyEMI || 0, remaining);
    return sum + emi;
  }, 0);

  const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
  const net = Math.max(0, grossEarnings - totalDeductions);

  return {
    employee,
    month,
    base,
    allowances,
    deductions,
    gross: grossEarnings,
    totalDeductions,
    net,
    attendanceDays: presentCount + officialLeaveCount + (halfDayCount * 0.5),
    leavesTaken: lopDays,
    loansToUpdate: approvedLoans // Pass through for internalProcessSalary
  };
};

// Internal function to process and SAVE salary
const internalProcessSalary = async (employeeId, month) => {
  // Handle existing salary record (Update/Overwrite logic)
  const existingSalary = await Salary.findOne({ employee: employeeId, month });

  // Calculate using the pure function
  const details = await calculateSalaryDetails(employeeId, month);

  let salary;
  let status = 'created'; // Default status
  if (existingSalary) {
    salary = existingSalary;
    salary.basicSalary = details.base;
    salary.allowances = details.allowances;
    salary.deductions = details.deductions;
    salary.gross = details.gross;
    salary.totalDeductions = details.totalDeductions;
    salary.net = details.net;
    salary.attendanceDays = details.attendanceDays;
    salary.leavesTaken = details.leavesTaken;
    salary.updatedAt = new Date();
    status = 'updated'; // Set status to updated if existing
  } else {
    salary = new Salary({
      employee: employeeId,
      month,
      basicSalary: details.base,
      allowances: details.allowances,
      deductions: details.deductions,
      gross: details.gross,
      totalDeductions: details.totalDeductions,
      net: details.net,
      attendanceDays: details.attendanceDays,
      leavesTaken: details.leavesTaken
    });
  }

  await salary.save();

  // Update loan records
  for (const loan of details.loansToUpdate) {
    const remaining = loan.amount - (loan.paidAmount || 0);
    const emiToPay = Math.min(loan.monthlyEMI || 0, remaining);

    if (emiToPay > 0) {
      loan.paidAmount = (loan.paidAmount || 0) + emiToPay;
      loan.remainingAmount = loan.amount - loan.paidAmount;

      if (loan.remainingAmount <= 0) {
        loan.remainingAmount = 0;
        loan.status = 'closed';
        loan.closedOn = new Date();
      }
      await loan.save();
    }
  }

  // Generate Payslip PDF
  const payslipsDir = path.join(__dirname, '../payslips');
  if (!fs.existsSync(payslipsDir)) fs.mkdirSync(payslipsDir, { recursive: true });

  const fileName = `Payslip_${employeeId}_${month}.pdf`;
  const pdfPath = path.join(payslipsDir, fileName);
  const relativePdfPath = `payslips/${fileName}`;

  await generatePayslipPDF(details.employee, salary, month, pdfPath);

  let payslip = await Payslip.findOne({ employee: employeeId, month });
  if (payslip) {
    payslip.salary = salary._id;
    payslip.pdfPath = relativePdfPath;
    payslip.updatedAt = new Date();
    await payslip.save();
  } else {
    payslip = new Payslip({
      employee: employeeId,
      salary: salary._id,
      month,
      pdfPath: relativePdfPath
    });
    await payslip.save();
  }

  return { status: status, salary, employeeName: details.employee.name, payslipId: payslip._id };
};

// GET Preview for employee
exports.previewSalary = async (req, res) => {
  try {
    const { employeeId, month } = req.query; // Use query params for GET
    if (!employeeId || !month) return res.status(400).json({ message: 'employeeId and month required' });

    const details = await calculateSalaryDetails(employeeId, month);
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Generate salary for an employee for a specific month
exports.generateSalary = async (req, res) => {
  try {
    const { employeeId, month } = req.body;

    // Authorization check
    const targetEmployee = await Employee.findById(employeeId);
    if (!targetEmployee) return res.status(404).json({ message: 'Target employee not found' });

    if (req.user.role === 'superior' && targetEmployee.role !== 'employee') {
      return res.status(403).json({ message: 'Superiors can only generate salary for regular employees' });
    }

    // Add restriction for Admin if they should ONLY generate for superiors?
    // User said "only admin can generate the slary to superior employee only"
    // This implies that Admin handles Superiors, and Superiors handle Employees.
    if (req.user.role === 'admin' && targetEmployee.role !== 'superior') {
      return res.status(403).json({ message: 'Admin role restricted to Superior personnel disbursement on this ledger' });
    }

    const result = await internalProcessSalary(employeeId, month);

    res.status(201).json({
      message: result.status === 'updated' ? 'Salary re-calculated and updated' : 'Salary processed successfully',
      salary: result.salary,
      emailStatus: 'Ready to send'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate salary for all active employees
exports.generateAllSalaries = async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) return res.status(400).json({ message: 'Month is required' });

    // Role-based target filtering
    let filter = { status: 'active' };
    if (req.user.role === 'admin') {
      filter.role = 'superior'; // Admin generates for Superiors as requested
    } else if (req.user.role === 'superior') {
      filter.role = 'employee'; // Superiors generate for regular employees
    } else {
      return res.status(403).json({ message: 'Access denied: Unauthorized role for batch processing' });
    }

    const activeEmployees = await Employee.find(filter);
    const results = [];
    const errors = [];

    for (const emp of activeEmployees) {
      try {
        const res = await internalProcessSalary(emp._id, month);
        results.push(res);
      } catch (err) {
        errors.push({ employeeName: emp.name, error: err.message });
      }
    }

    res.json({
      message: `Batch processing complete for cycle ${month}`,
      successCount: results.filter(r => r.status === 'success').length,
      alreadyCount: results.filter(r => r.status === 'already_exists').length,
      errorCount: errors.length,
      errors
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get salary history for employee
exports.getSalaryHistory = async (req, res) => {
  try {
    const salaries = await Salary.find({ employee: req.params.employeeId })
      .populate('employee', 'name email department position')
      .sort({ month: -1, updatedAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all salaries
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employee', 'name email department position')
      .sort({ month: -1, updatedAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
