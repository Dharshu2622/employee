const Employee = require('../models/Employee');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      role: { $in: ['employee', 'superior'] }
    }).populate('manager', 'name email').select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('manager', 'name email').select('-password');
    if (!employee) return res.status(404).json({ message: 'Personnel not found' });

    // Access control: allow if requester is admin or superior or the employee themself
    const requester = req.user;
    if (requester.role !== 'admin' && requester.role !== 'superior' && requester.id !== req.params.id) {
      return res.status(403).json({ message: 'Administrative access denied' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, department, position, dateOfBirth, role, manager, gender, baseSalary } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Identity signature (email) already exists' });
    }

    const employee = new Employee({
      name,
      email,
      password,
      phone,
      department,
      position,
      dateOfBirth,
      role: role || 'employee',
      manager: manager || null,
      gender: gender || 'male',
      baseSalary: baseSalary || 0
    });

    await employee.save();
    res.status(201).json({ message: 'Personnel onboarding complete', employee: { ...employee._doc, password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'superior' && requester.role !== 'admin' && requester.id !== req.params.id) {
      return res.status(403).json({ message: 'Administrative access denied' });
    }

    // Role protection
    if (requester.id === req.params.id && 'role' in req.body && requester.role !== 'admin') {
      delete req.body.role;
    }

    // Handle empty manager ID to prevent CastError
    if (req.body.manager === '') {
      req.body.manager = null;
    }

    // Handle password update - hash if provided
    if (req.body.password && req.body.password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } else {
      // Don't update password if not provided or empty
      delete req.body.password;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('manager', 'name email').select('-password');

    if (!employee) return res.status(404).json({ message: 'Personnel signature not found' });
    res.json({ message: 'Personnel record successfully updated', employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'superior' && requester.role !== 'admin') {
      return res.status(403).json({ message: 'Administrative access denied' });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) return res.status(404).json({ message: 'Personnel signature not found' });
    res.json({ message: 'Personnel identity removed from primary ledger' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get demographics summary
exports.getDemographicsSummary = async (req, res) => {
  try {
    const total = await Employee.countDocuments({ role: { $in: ['employee', 'superior'] } });
    const male = await Employee.countDocuments({ role: { $in: ['employee', 'superior'] }, gender: 'male' });
    const female = await Employee.countDocuments({ role: { $in: ['employee', 'superior'] }, gender: 'female' });
    const other = await Employee.countDocuments({ role: { $in: ['employee', 'superior'] }, gender: 'other' });

    res.json({
      totalEmployees: total,
      maleCount: male,
      femaleCount: female,
      otherCount: other
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
