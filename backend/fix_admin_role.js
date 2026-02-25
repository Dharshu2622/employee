require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

async function fixAdminRole() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/salary_management';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', uri);

    const email = 'admin@company.com'; // provided admin email
    const updated = await Employee.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );

    if (!updated) {
      console.log('No employee found with email:', email);
    } else {
      console.log('Updated employee role to admin:', updated.email, updated._id.toString());
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixAdminRole();
