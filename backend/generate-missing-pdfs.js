require('dotenv').config();
const mongoose = require('mongoose');
const Payslip = require('./models/Payslip');
const Salary = require('./models/Salary');
const Employee = require('./models/Employee');
const { generatePayslipPDF } = require('./utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

async function generateMissingPDFs() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/salary_management');
    console.log('Connected to MongoDB');

    // Ensure payslips directory exists
    const payslipsDir = path.join(__dirname, 'payslips');
    if (!fs.existsSync(payslipsDir)) {
      fs.mkdirSync(payslipsDir, { recursive: true });
      console.log('Created payslips directory');
    }

    // Get all payslips
    const payslips = await Payslip.find()
      .populate('employee')
      .populate('salary');

    console.log(`Found ${payslips.length} payslips in database`);

    let generated = 0;
    let failed = 0;

    for (const payslip of payslips) {
      try {
        // Skip if employee or salary is missing
        if (!payslip.employee) {
          console.log(`⚠ Skipping payslip ${payslip.month} - Employee not found`);
          continue;
        }
        if (!payslip.salary) {
          console.log(`⚠ Skipping payslip ${payslip.month} for ${payslip.employee.name} - Salary data missing`);
          continue;
        }

        // Check if PDF already exists
        let pdfPath = payslip.pdfPath;
        let absolutePath = pdfPath;
        
        if (!path.isAbsolute(pdfPath)) {
          absolutePath = path.join(__dirname, pdfPath);
        }

        if (fs.existsSync(absolutePath)) {
          console.log(`✓ PDF already exists: ${payslip.month} for ${payslip.employee.name}`);
          continue;
        }

        // Generate PDF
        const fileName = `Payslip_${payslip.employee._id}_${payslip.month}.pdf`;
        const newPdfPath = path.join(payslipsDir, fileName);

        console.log(`Generating PDF for ${payslip.employee.name} - ${payslip.month}...`);
        
        await generatePayslipPDF(
          payslip.employee,
          payslip.salary,
          payslip.month,
          newPdfPath
        );

        // Update payslip with correct PDF path
        const relativePath = `payslips/${fileName}`;
        payslip.pdfPath = relativePath;
        await payslip.save();

        console.log(`✓ Generated: ${payslip.month} for ${payslip.employee.name}`);
        generated++;
      } catch (err) {
        const empName = payslip.employee ? payslip.employee.name : 'Unknown';
        console.error(`✗ Failed to generate for ${empName}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\nSummary: Generated ${generated} PDFs, ${failed} failed`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

generateMissingPDFs();
