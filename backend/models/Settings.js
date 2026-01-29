const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    organization: {
        name: { type: String, default: 'SalaryPro Global Inc.' },
        logoUrl: { type: String, default: '' },
        financialYear: { type: String, default: '2025 - 2026' },
        address: { type: String, default: '' },
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'IST' }
    },
    payroll: {
        basicSalaryPercent: { type: Number, default: 50 },
        hraPercent: { type: Number, default: 20 },
        pfEmployerPercent: { type: Number, default: 12 },
        esiEmployerPercent: { type: Number, default: 3.25 },
        professionalTax: { type: Number, default: 200 },
        roundingRule: { type: String, default: 'None' },
        autoBonus: { type: Boolean, default: true }
    },
    attendance: {
        gracePeriodMins: { type: Number, default: 15 },
        halfDayThresholdHrs: { type: Number, default: 4.5 }
    },
    loan: {
        maxLoanMultiplier: { type: Number, default: 3 },
        interestRatePercent: { type: Number, default: 6.5 },
        eligibilityMonths: { type: Number, default: 12 },
        hrInterviewRequired: { type: Boolean, default: true }
    },
    security: {
        twoFactorAuth: { type: Boolean, default: true },
        sessionTimeoutMins: { type: Number, default: 20 },
        strongPasswordPolicy: { type: Boolean, default: true },
        lockoutAfterFailedAttempts: { type: Boolean, default: true }
    },
    theme: {
        darkMode: { type: Boolean, default: false },
        language: { type: String, default: 'EN' },
        density: { type: String, default: 'Default' },
        payslipTheme: { type: String, default: 'ModernBlue' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
