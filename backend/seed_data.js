const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const dbURI = 'mongodb://localhost:27017/employee-salary-management';

const EmployeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: { type: String, default: 'temp123' },
    department: String,
    position: String,
    phone: String,
    gender: String,
    baseSalary: Number,
    role: { type: String, default: 'employee' }
});

const AttendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    date: Date,
    status: String
});

const Employee = mongoose.model('Employee', EmployeeSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);

async function seed() {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to DB');

        // Clear existing (optional - user might have some data)
        // await Employee.deleteMany({});
        // await Attendance.deleteMany({});

        const count = await Employee.countDocuments();
        if (count > 0) {
            console.log('DB already seeded');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('temp123', salt);

        const employees = [
            { name: 'John Doe', email: 'john@enterprise.com', password, department: 'Engineering', position: 'Lead Dev', phone: '1234567890', gender: 'male', baseSalary: 85000 },
            { name: 'Jane Smith', email: 'jane@enterprise.com', password, department: 'Finance', position: 'Auditor', phone: '0987654321', gender: 'female', baseSalary: 75000 },
            { name: 'Michael Ross', email: 'michael@enterprise.com', password, department: 'Executive', position: 'Director', phone: '5551234567', gender: 'male', baseSalary: 125000 },
            { name: 'Sarah Connor', email: 'sarah@enterprise.com', password, department: 'Operations', position: 'Manager', phone: '5559876543', gender: 'female', baseSalary: 65000 }
        ];

        const createdEmployees = await Employee.insertMany(employees);
        console.log('Employees created');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecords = [
            { employee: createdEmployees[0]._id, date: today, status: 'present' },
            { employee: createdEmployees[1]._id, date: today, status: 'halfday' },
            { employee: createdEmployees[2]._id, date: today, status: 'leave' },
            { employee: createdEmployees[3]._id, date: today, status: 'absent' }
        ];

        await Attendance.insertMany(attendanceRecords);
        console.log('Attendance seeded');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
