const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendPayslipEmail = async (employeeEmail, employeeName, month, pdfPath) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `Your Payslip for ${month}`,
      html: `
        <h2>Dear ${employeeName},</h2>
        <p>Your payslip for ${month} is attached.</p>
        <p>Best regards,<br/>HR Department</p>
      `,
      attachments: [
        {
          filename: `Payslip_${month}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payslip email sent to ${employeeEmail}`);
    return true;
  } catch (err) {
    console.error('Email error:', err);
    return false;
  }
};

const sendNotificationEmail = async (employeeEmail, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject,
      html
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Email error:', err);
    return false;
  }
};

module.exports = { sendPayslipEmail, sendNotificationEmail };
