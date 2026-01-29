const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['employee', 'admin', 'superior'], default: 'employee' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  department: { type: String },
  position: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  dateOfJoining: { type: Date, default: Date.now },
  dateOfBirth: { type: Date },
  address: { type: String },
  photo: { type: String },
  baseSalary: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
employeeSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
