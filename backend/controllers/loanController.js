const Loan = require('../models/Loan');

// Request loan
exports.requestLoan = async (req, res) => {
  try {
    const { employee, amount, termMonths, reason } = req.body;

    const monthlyEMI = Math.round(amount / termMonths);

    const loan = new Loan({
      employee,
      amount,
      termMonths,
      monthlyEMI,
      reason,
      remainingAmount: amount
    });

    await loan.save();
    res.status(201).json({
      message: 'Loan request submitted successfully',
      loan,
      monthlyEMI
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name email')
      .sort({ appliedOn: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get loans by employee
exports.getLoansByEmployee = async (req, res) => {
  try {
    const loans = await Loan.find({ employee: req.params.employeeId })
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name email')
      .sort({ appliedOn: -1 });
    res.json(loans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve loan
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user.id, approvedOn: new Date() },
      { new: true }
    ).populate('employee');

    res.json({ message: 'Loan approved successfully', loan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject loan
exports.rejectLoan = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user.id,
        approvedOn: new Date(),
        rejectionReason: rejectionReason?.trim() || 'No reason provided'
      },
      { new: true }
    ).populate('employee');

    res.json({ message: 'Loan rejected successfully', loan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
