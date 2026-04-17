import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/User.model.js';

// ═══════════════════════════════════════════════════════════════
// CHECK DATABASE USERS
// ═══════════════════════════════════════════════════════════════

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('\n✅ Connected to MongoDB\n');

        const users = await User.find({}).select('-password');

        if (users.length === 0) {
            console.log('❌ No users found in database.\n');
            console.log('Run seed script: npx tsx src/seed.ts\n');
        } else {
            console.log(`✅ Found ${users.length} user(s):\n`);
            users.forEach((user) => {
                console.log(`   📧 ${user.email}`);
                console.log(`      Name: ${user.name}`);
                console.log(`      Role: ${user.role}`);
                console.log(`      Active: ${user.isActive}\n`);
            });
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
