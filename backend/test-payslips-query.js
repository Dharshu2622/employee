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
  
  // Find a superior
  const superior = await Employee.findOne({ role: 'superior' });
  
  if (!superior) {
    console.log('No superior found');
    process.exit(1);
  }
  
  console.log(`\nFound superior: ${superior.name} (ID: ${superior._id})`);
  
  // Query payslips for this superior (simulating the getMyPayslips function)
  const payslips = await Payslip.find({ employee: superior._id })
    .populate('salary')
    .sort({ month: -1, createdAt: -1 });
  
  console.log(`\nPayslips found: ${payslips.length}`);
  
  if (payslips.length > 0) {
    console.log('\nPayslips with Salary Data:');
    payslips.forEach((ps, i) => {
      console.log(`\n  Payslip ${i + 1}:`);
      console.log(`    Month: ${ps.month}`);
      console.log(`    Year: ${ps.year}`);
      console.log(`    Status: ${ps.status}`);
      console.log(`    Salary Object: ${ps.salary ? 'YES' : 'NO'}`);
      if (ps.salary) {
        console.log(`      Gross: ${ps.salary.gross}`);
        console.log(`      Net: ${ps.salary.net}`);
        console.log(`      BasicSalary: ${ps.salary.basicSalary}`);
      }
    });
  } else {
    console.log('  No payslips found for this superior!');
  }
  
  process.exit();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
