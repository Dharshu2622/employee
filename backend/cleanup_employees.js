require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin', 'superior'], default: 'employee' },
    department: { type: String },
    position: { type: String },
    baseSalary: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' }
});

const Employee = mongoose.model('Employee', employeeSchema);

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salary_management');
        console.log('Connected to MongoDB');

        // Delete all users with role 'employee' except 'Mike'
        const result = await Employee.deleteMany({
            role: 'employee',
            name: { $ne: 'Mike' }
        });
        console.log(`Deleted ${result.deletedCount} employees.`);

        // Check if Mike exists, if not create him
        const mike = await Employee.findOne({ name: 'Mike' });
        if (!mike) {
            const mikeUser = new Employee({
                name: 'Mike',
                email: 'mike@company.com',
                password: await bcrypt.hash('mike123', 10),
                role: 'employee',
                department: 'Finance',
                position: 'Finance Officer',
                baseSalary: 75000,
                status: 'active'
            });
            await mikeUser.save();
            console.log('Created default employee: Mike');
        } else {
            console.log('Mike already exists.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
