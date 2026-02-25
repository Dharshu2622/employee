require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// First, let's get a superior's ID
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const Employee = require('./models/Employee');
  
  // Find a superior
  const superior = await Employee.findOne({ role: 'superior' });
  
  if (!superior) {
    console.log('No superior found');
    process.exit(1);
  }
  
  console.log(`Found superior: ${superior.name} (ID: ${superior._id}, Email: ${superior.email})`);
  
  // Log in and get token
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: superior.email,
      password: 'superior123' // Default seed password
    });
    
    if (loginRes.data.token) {
      console.log('Login successful, token obtained');
      const token = loginRes.data.token;
      
      // Call the payslips API
      console.log('\nCalling /payslips/my-payslips...');
      const payslipsRes = await axios.get('http://localhost:5000/api/payslips/my-payslips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`Response Status: ${payslipsRes.status}`);
      console.log(`Number of Payslips: ${payslipsRes.data.length}`);
      console.log('\nPayslips Data:');
      payslipsRes.data.forEach((ps, i) => {
        console.log(`\n  Payslip ${i + 1}:`);
        console.log(`    Month: ${ps.month}`);
        console.log(`    Status: ${ps.status}`);
        console.log(`    Salary Object: ${ps.salary ? 'Found' : 'NOT FOUND'}`);
        if (ps.salary) {
          console.log(`      - Gross: ${ps.salary.gross}`);
          console.log(`      - Net: ${ps.salary.net}`);
        }
      });
    } else {
      console.log('Login failed');
    }
  } catch (err) {
    console.error('API Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
  
  process.exit();
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
