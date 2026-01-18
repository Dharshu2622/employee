require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['employee', 'admin', 'superior'], default: 'employee' },
  department: { type: String },
  position: { type: String },
  dateOfJoining: { type: Date, default: Date.now },
  dateOfBirth: { type: Date },
  address: { type: String },
  photo: { type: String },
  baseSalary: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Employee = mongoose.model('Employee', employeeSchema);

async function createUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salary_management');
    console.log('✅ MongoDB connected');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await Employee.deleteMany({});
    // console.log('Cleared existing employees');

    // Create Admin User
    const adminExists = await Employee.findOne({ email: 'admin@company.com' });
    if (!adminExists) {
      const admin = new Employee({
        name: 'Admin User',
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        position: 'Administrator',
        baseSalary: 100000,
        status: 'active'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@company.com / admin123');
    } else {
      console.log('⚠️ Admin user already exists');
    }

    // Create Employee User
    const employeeExists = await Employee.findOne({ email: 'john@company.com' });
    if (!employeeExists) {
      const employee = new Employee({
        name: 'John Doe',
        email: 'john@company.com',
        password: 'employee123',
        role: 'employee',
        department: 'IT',
        position: 'Software Engineer',
        baseSalary: 60000,
        status: 'active'
      });
      await employee.save();
      console.log('✅ Employee user created: john@company.com / employee123');
    } else {
      console.log('⚠️ Employee user already exists');
    }

      // Create Superior User
      const superiorExists = await Employee.findOne({ email: 'superior@company.com' });
      if (!superiorExists) {
        const superior = new Employee({
          name: 'Superior User',
          email: 'superior@company.com',
          password: 'superior123',
          role: 'superior',
          department: 'HR',
          position: 'HR Officer',
          baseSalary: 80000,
          status: 'active'
        });
        await superior.save();
        console.log('✅ Superior user created: superior@company.com / superior123');
      } else {
        console.log('⚠️ Superior user already exists');
      }

    // Create More Test Users
    const sarah = await Employee.findOne({ email: 'sarah@company.com' });
    if (!sarah) {
      const sarahUser = new Employee({
        name: 'Sarah Williams',
        email: 'sarah@company.com',
        password: 'sarah123',
        role: 'employee',
        department: 'HR',
        position: 'HR Manager',
        baseSalary: 55000,
        status: 'active'
      });
      await sarahUser.save();
      console.log('✅ Employee user created: sarah@company.com / sarah123');
    }

    const mike = await Employee.findOne({ email: 'mike@company.com' });
    if (!mike) {
      const mikeUser = new Employee({
        name: 'Mike Johnson',
        email: 'mike@company.com',
        password: 'mike123',
        role: 'employee',
        department: 'Finance',
        position: 'Finance Officer',
        baseSalary: 70000,
        status: 'active'
      });
      await mikeUser.save();
      console.log('✅ Employee user created: mike@company.com / mike123');
    }

    console.log('\n✅ All users created successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Employee Logins:');
    console.log('  Email: john@company.com    | Password: employee123');
    console.log('  Email: sarah@company.com   | Password: sarah123');
    console.log('  Email: mike@company.com    | Password: mike123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createUsers();
