const Leave = require('../models/Leave');

// Request leave
exports.requestLeave = async (req, res) => {
  try {
    const { employee, type, fromDate, toDate, reason } = req.body;

    const leave = new Leave({
      employee,
      type,
      fromDate,
      toDate,
      reason
    });

    await leave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name email')
      .sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get leaves by employee
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.params.employeeId })
      .populate('approvedBy', 'name email')
      .sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user.id, approvedOn: new Date() },
      { new: true }
    ).populate('employee');

    res.json({ message: 'Leave approved successfully', leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject leave
exports.rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected', 
        approvedBy: req.user.id, 
        approvedOn: new Date(),
        rejectionReason: rejectionReason.trim()
      },
      { new: true }
    ).populate('employee');

    res.json({ message: 'Leave rejected successfully', leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
