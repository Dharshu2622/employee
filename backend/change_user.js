require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

async function changeUser() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/salary_management';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const fromEmail = 'john@company.com';
    const toEmail = 'mike@company.com';
    const newPassword = 'mike123';

    const existing = await Employee.findOne({ email: toEmail });
    if (existing) {
      console.error('Target email already exists in database:', toEmail);
      process.exit(1);
    }

    const user = await Employee.findOne({ email: fromEmail });
    if (!user) {
      console.error('User not found with email:', fromEmail);
      process.exit(1);
    }

    user.email = toEmail;
    user.password = newPassword; // pre-save hook will hash
    await user.save();

    console.log(`Updated user ${fromEmail} -> ${toEmail} and set new password.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

changeUser();
