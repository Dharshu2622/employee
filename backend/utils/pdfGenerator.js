const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePayslipPDF = (employee, salary, month, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('PAYSLIP', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Employee Salary Management System', { align: 'center' });
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Employee Info
      doc.fontSize(11).font('Helvetica-Bold').text('Employee Information', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${employee.name}`);
      doc.text(`Email: ${employee.email}`);
      doc.text(`Department: ${employee.department}`);
      doc.text(`Position: ${employee.position}`);
      doc.text(`Month: ${month}`);
      doc.moveDown();

      // Earnings
      doc.fontSize(11).font('Helvetica-Bold').text('Earnings', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Basic Salary: ₹${salary.basicSalary.toLocaleString()}`);
      doc.text(`HRA: ₹${salary.allowances.hra.toLocaleString()}`);
      doc.text(`DA: ₹${salary.allowances.da.toLocaleString()}`);
      doc.text(`Travel Allowance: ₹${salary.allowances.travel.toLocaleString()}`);
      doc.text(`Medical Allowance: ₹${salary.allowances.medical.toLocaleString()}`);
      doc.font('Helvetica-Bold').text(`Gross Earnings: ₹${salary.gross.toLocaleString()}`);
      doc.moveDown();

      // Deductions
      doc.font('Helvetica-Bold').fontSize(11).text('Deductions', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`PF: ₹${salary.deductions.pf.toLocaleString()}`);
      doc.text(`Tax: ₹${salary.deductions.tax.toLocaleString()}`);
      doc.text(`Insurance: ₹${salary.deductions.insurance.toLocaleString()}`);

      if (salary.deductions.loanEMI > 0) {
        doc.text(`Loan EMI: ₹${salary.deductions.loanEMI.toLocaleString()}`);
      }

      doc.font('Helvetica-Bold').text(`Total Deductions: ₹${salary.totalDeductions.toLocaleString()}`);
      doc.moveDown();

      // Net Salary
      doc.fontSize(12).font('Helvetica-Bold').text(`Net Salary: ₹${salary.net.toLocaleString()}`, { color: '#22c55e' });
      doc.moveDown();

      // Footer
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.fontSize(9).font('Helvetica').text('This is a system-generated payslip. No signature required.', { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(true);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePayslipPDF };
