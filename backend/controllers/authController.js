const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');

// Generic login for any role (admin / superior / employee)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await Employee.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email address. Please check your email or contact your administrator.' });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password. Please try again or use Access Recovery.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get simulation users (public)
exports.getSimulationUsers = async (req, res) => {
  try {
    const employees = await Employee.find({ role: 'employee' }).select('name email department position');
    const superiors = await Employee.find({ role: 'superior' }).select('name email department position');
    const admins = await Employee.find({ role: 'admin' }).select('name email department position');

    res.json({
      employees,
      superiors,
      admins
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
