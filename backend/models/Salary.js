const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // YYYY-MM format
  basicSalary: { type: Number, default: 0 },
  allowances: {
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    loanEMI: { type: Number, default: 0 },
    leaveDeduction: { type: Number, default: 0 }
  },
  gross: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  net: { type: Number, default: 0 },
  attendanceDays: { type: Number, default: 0 },
  leavesTaken: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Salary', salarySchema);
