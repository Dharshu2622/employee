const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  type: { type: String, enum: ['sick', 'casual', 'earned', 'unpaid'], default: 'casual' },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  appliedOn: { type: Date, default: Date.now },
  approvedOn: { type: Date },
  rejectionReason: { type: String, default: null }
});

module.exports = mongoose.model('Leave', leaveSchema);
