const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  amount: { type: Number, required: true },
  termMonths: { type: Number, required: true },
  monthlyEMI: { type: Number, default: 0 },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'closed'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  appliedOn: { type: Date, default: Date.now },
  approvedOn: { type: Date },
  closedOn: { type: Date },
  remainingAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  rejectionReason: { type: String, default: null }
});

module.exports = mongoose.model('Loan', loanSchema);
