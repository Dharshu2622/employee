const Payslip = require('../models/Payslip');
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const { generatePayslipPDF } = require('../utils/pdfGenerator');
const { sendPayslipEmail } = require('../utils/mailer');
const path = require('path');
const fs = require('fs');

// Generate payslip
exports.generatePayslip = async (req, res) => {
  try {
    const { employeeId, month } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    let salary = await Salary.findOne({ employee: employeeId, month });
    if (!salary) {
      // Create default salary record if not exists
      salary = new Salary({
        employee: employeeId,
        month,
        basicSalary: employee.baseSalary
      });
      await salary.save();
    }

    const payslipsDir = path.join(__dirname, '../payslips');
    if (!fs.existsSync(payslipsDir)) {
      fs.mkdirSync(payslipsDir, { recursive: true });
    }

    const pdfPath = path.join(payslipsDir, `Payslip_${employeeId}_${month}.pdf`);
    await generatePayslipPDF(employee, salary, month, pdfPath);

    let payslip = await Payslip.findOne({ employee: employeeId, month });
    if (!payslip) {
      payslip = new Payslip({
        employee: employeeId,
        salary: salary._id,
        month,
        pdfPath
      });
      await payslip.save();
    }

    res.json({ message: 'Payslip generated successfully', payslip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all payslips
exports.getAllPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find()
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download payslip
exports.downloadPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ message: 'Payslip record not found' });

    let pdfPath = payslip.pdfPath;

    // Resolve absolute path
    let absolutePath = pdfPath;
    if (!path.isAbsolute(pdfPath)) {
      absolutePath = path.join(__dirname, '../', pdfPath);
    }

    // Recovery logic: if path stored is invalid, try resolving just by fileName
    if (!fs.existsSync(absolutePath)) {
      const fileName = path.basename(pdfPath);
      const recoveredPath = path.join(__dirname, '../payslips', fileName);
      if (fs.existsSync(recoveredPath)) {
        absolutePath = recoveredPath;
      } else {
        return res.status(404).json({ message: 'Physical PDF archetyped file not found' });
      }
    }

    res.download(absolutePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send payslip via email
exports.sendPayslipEmail = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate('employee');
    if (!payslip) return res.status(404).json({ message: 'Payslip not found' });

    const employee = payslip.employee;
    const success = await sendPayslipEmail(
      employee.email,
      employee.name,
      payslip.month,
      payslip.pdfPath
    );

    if (success) {
      payslip.emailSent = true;
      payslip.sentOn = new Date();
      await payslip.save();
      res.json({ message: 'Payslip sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send payslip' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payslips by employee
exports.getPayslipsByEmployee = async (req, res) => {
  try {
    const payslips = await Payslip.find({ employee: req.params.employeeId })
      .sort({ month: -1, createdAt: -1 });
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
