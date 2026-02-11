require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Dynamically load models to avoid path issues
const Leave = require('./models/Leave');
const Employee = require('./models/Employee');

async function cleanup() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/salary_management';
        console.log(`Connecting to: ${mongoUri.replace(/\/\/.*@/, '//****:****@')}`);

        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Find all leaves and check for orphaned ones
        const leaves = await Leave.find();
        console.log(`Analyzing ${leaves.length} leave records...`);

        const toDeleteIds = [];
        for (const leave of leaves) {
            const empExists = await Employee.exists({ _id: leave.employee });
            if (!empExists) {
                console.log(`[ORPHANED] Marking Leave ID ${leave._id} for deletion (Employee ${leave.employee} missing)`);
                toDeleteIds.push(leave._id);
            }
        }

        if (toDeleteIds.length > 0) {
            const result = await Leave.deleteMany({ _id: { $in: toDeleteIds } });
            console.log(`✓ successfully purged ${result.deletedCount} orphaned leave records.`);
        } else {
            console.log('✓ No orphaned leave requests found.');
        }

        console.log('Cleanup process completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Cleanup failed:', err.message);
        process.exit(1);
    }
}

cleanup();
