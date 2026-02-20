const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Payslip = require('./models/Payslip');
const Salary = require('./models/Salary');
const path = require('path');
const fs = require('fs');

async function fixSuperior1() {
    try {
        await mongoose.connect('mongodb://localhost:27017/employee');
        console.log('Connected to DB');

        const superior1 = await Employee.findOne({ name: /superior1/i });
        if (!superior1) {
            console.log('Superior1 not found');
            return;
        }
        console.log('Superior1 ID:', superior1._id);

        const month = '2026-02';
        const payslip = await Payslip.findOne({ employee: superior1._id, month });

        if (payslip) {
            console.log('Existing payslip record found:', payslip._id);
            console.log('Stored Path:', payslip.pdfPath);

            const fileName = `Payslip_${superior1._id}_${month}.pdf`;
            const correctPath = path.join(__dirname, 'payslips', fileName);
            console.log('Correct Path should be:', correctPath);

            if (!fs.existsSync(payslip.pdfPath) && fs.existsSync(correctPath)) {
                console.log('Found physical file at correct path, updating DB...');
                payslip.pdfPath = correctPath;
                await payslip.save();
            } else if (!fs.existsSync(correctPath)) {
                console.log('Physical file does not exist anywhere. Deleting orphaned record...');
                await Payslip.findByIdAndDelete(payslip._id);
            }
        } else {
            console.log('No payslip record found for superior1 in Feb 2026');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixSuperior1();
