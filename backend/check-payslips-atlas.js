require('dotenv').config();
const mongoose = require('mongoose');
const Payslip = require('./models/Payslip');
const Salary = require('./models/Salary');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB Atlas');
  
  // Get all employees
  const employees = await Employee.find({}, { name: 1, role: 1, email: 1, _id: 1 });
  console.log('\nAll Employees:');
  if (employees.length === 0) {
    console.log('  No employees found');
  } else {
    employees.forEach(emp => {
      console.log(`  - ${emp.name} (ID: ${emp._id}, Email: ${emp.email}, Role: ${emp.role})`);
    });
  }
  
  // Get all payslips
  const payslips = await Payslip.find({}).populate('employee', 'name email').populate('salary');
  console.log('\nAll Payslips:');
  if (payslips.length === 0) {
    console.log('  No payslips found');
  } else {
    payslips.forEach(ps => {
      console.log(`  - Employee: ${ps.employee?.name} (${ps.employee?.email}), Month: ${ps.month}, Status: ${ps.status}`);
      if (ps.salary) {
        console.log(`    Gross: ${ps.salary.gross}, Net: ${ps.salary.net}`);
      }
    });
  }
  
  // Get all salaries
  const salaries = await Salary.find({}).populate('employee', 'name email');
  console.log('\nAll Salaries:');
  if (salaries.length === 0) {
    console.log('  No salaries found');
  } else {
    salaries.slice(0, 5).forEach(sal => {
      console.log(`  - Employee: ${sal.employee?.name}, Month: ${sal.month}, Gross: ${sal.gross}, Net: ${sal.net}`);
    });
  }
  
  process.exit();
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
