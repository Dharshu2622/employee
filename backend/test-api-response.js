require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const Salary = require('./models/Salary');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB Atlas\n');
  
  // Get a superior
  const superior = await Employee.findOne({ role: 'superior' });
  
  if (!superior) {
    console.log('No superior found');
    process.exit(1);
  }
  
  console.log(`Testing API response for: ${superior.name} (ID: ${superior._id})`);
  console.log('═'.repeat(50));
  
  // Simulate what the API does
  console.log('\n1️⃣  Direct database query:');
  const payslips = await Payslip.find({ employee: superior._id })
    .populate('salary')
    .sort({ month: -1, createdAt: -1 });
  
  console.log(`   Found: ${payslips.length} payslips`);
  
  if (payslips.length > 0) {
    console.log('\n   First payslip data:');
    const ps = payslips[0];
    console.log(`   - Month: ${ps.month}`);
    console.log(`   - Year: ${ps.year}`);
    console.log(`   - Status: ${ps.status}`);
    console.log(`   - Has salary object: ${ps.salary ? 'YES' : 'NO'}`);
    if (ps.salary) {
      console.log(`   - Salary.gross: ${ps.salary.gross}`);
      console.log(`   - Salary.net: ${ps.salary.net}`);
    }
    
    console.log('\n2️⃣  Full response as JSON:');
    console.log(JSON.stringify(payslips.slice(0, 2), null, 2));
  } else {
    console.log('   ❌ No payslips found');
  }
  
  process.exit();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
