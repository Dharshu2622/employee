const Employee = require('../models/Employee');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Access control: allow if requester is admin or superior or the employee themself
    const requester = req.user;
    if (requester.role !== 'admin' && requester.role !== 'superior' && requester.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, department, position, dateOfBirth } = req.body;
    
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const employee = new Employee({
      name,
      email,
      password,
      phone,
      department,
      position,
      dateOfBirth,
      role: 'employee'
    });

    await employee.save();
    res.status(201).json({ message: 'Employee created successfully', employee: { ...employee._doc, password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    // Only superior or the employee themself can update profile
    const requester = req.user;
    if (requester.role !== 'superior' && requester.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent role changes by non-superior
    if (requester.role !== 'superior' && 'role' in req.body) {
      delete req.body.role;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee updated successfully', employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: 'terminated' },
      { new: true }
    );

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee terminated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
