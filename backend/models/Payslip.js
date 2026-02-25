const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  salary: { type: mongoose.Schema.Types.ObjectId, ref: 'Salary', required: true },
  month: { type: String, required: true },
  year: { type: Number },
  pdfPath: { type: String },
  status: { type: String, enum: ['pending', 'paid', 'processing'], default: 'pending' },
  emailSent: { type: Boolean, default: false },
  sentOn: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payslip', payslipSchema);
