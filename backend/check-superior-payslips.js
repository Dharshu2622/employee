require('dotenv').config();
const mongoose = require('mongoose');
const Payslip = require('./models/Payslip');
const Salary = require('./models/Salary');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB Atlas\n');
  
  // Get all superior employees
  const superiors = await Employee.find({ role: 'superior' }, { name: 1, email: 1, _id: 1 });
  
  console.log('=== ALL SUPERIORS ===');
  superiors.forEach(superior => {
    console.log(`  - ${superior.name} (ID: ${superior._id}, Email: ${superior.email})`);
  });
  
  // Check payslips for each superior
  console.log('\n=== PAYSLIPS FOR EACH SUPERIOR ===');
  
  for (const superior of superiors) {
    const payslips = await Payslip.find({ employee: superior._id })
      .populate('salary')
      .sort({ month: -1 });
    
    console.log(`\n${superior.name} (${superior.email}):`);
    
    if (payslips.length === 0) {
      console.log('  ❌ No payslips found');
    } else {
      console.log(`  ✓ Found ${payslips.length} payslips:`);
      payslips.forEach(ps => {
        console.log(`    - Month: ${ps.month}, Status: ${ps.status}, Gross: ${ps.salary?.gross}, Net: ${ps.salary?.net}`);
      });
    }
  }
  
  process.exit();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
