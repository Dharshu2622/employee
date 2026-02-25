const mongoose = require('mongoose');
const Payslip = require('./models/Payslip');
const Salary = require('./models/Salary');
const Employee = require('./models/Employee');

mongoose.connect('mongodb://localhost:27017/salary-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Get all employees
  const employees = await Employee.find({}, { name: 1, role: 1, _id: 1 });
  console.log('\nAll Employees:');
  employees.forEach(emp => {
    console.log(`  - ${emp.name} (ID: ${emp._id}, Role: ${emp.role})`);
  });
  
  // Get all payslips
  const payslips = await Payslip.find({}).populate('employee', 'name').populate('salary');
  console.log('\nAll Payslips:');
  if (payslips.length === 0) {
    console.log('  No payslips found');
  } else {
    payslips.forEach(ps => {
      console.log(`  - Employee: ${ps.employee.name}, Month: ${ps.month}, Status: ${ps.status}`);
    });
  }
  
  // Get all salaries
  const salaries = await Salary.find({}).populate('employee', 'name');
  console.log('\nAll Salaries:');
  if (salaries.length === 0) {
    console.log('  No salaries found');
  } else {
    salaries.forEach(sal => {
      console.log(`  - Employee: ${sal.employee.name}, Month: ${sal.month}, Gross: ${sal.gross}, Net: ${sal.net}`);
    });
  }
  
  process.exit();
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
