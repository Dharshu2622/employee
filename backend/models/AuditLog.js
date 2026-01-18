const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  resource: { type: String },
  resourceId: { type: String },
  operation: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
