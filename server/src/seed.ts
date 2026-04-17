import 'dotenv/config';
import mongoose from 'mongoose';
import { User, UserRole } from './models/User.model.js';

// ═══════════════════════════════════════════════════════════════
// SEED USERS
// ═══════════════════════════════════════════════════════════════

const seedUsers = [
    {
        email: 'admin@ttdn.com',
        password: 'admin123',
        name: 'Admin TTDN',
        phone: '0987654321',
        role: UserRole.ADMIN,
        isActive: true,
    },
    {
        email: 'user@ttdn.com',
        password: 'user123',
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        role: UserRole.CUSTOMER,
        isActive: true,
    },
    {
        email: 'test@ttdn.com',
        password: 'test123',
        name: 'Test User',
        phone: '0909090909',
        role: UserRole.CUSTOMER,
        isActive: true,
    },
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || '';
        if (!mongoUri || mongoUri.includes('<user>')) {
            console.error('❌ MongoDB URI not configured in .env file!');
            console.log('\nPlease set MONGODB_URI in .env file first.\n');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await User.deleteMany({});
        // console.log('🗑️  Cleared existing users\n');

        // Check if users already exist
        const existingUsers = await User.find({
            email: { $in: seedUsers.map((u) => u.email) },
        });

        if (existingUsers.length > 0) {
            console.log('⚠️  Users already exist:');
            existingUsers.forEach((user) => {
                console.log(`   - ${user.email} (${user.role})`);
            });
            console.log('\n💡 Tip: Delete these users first if you want to re-seed.\n');
            process.exit(0);
        }

        // Create users
        console.log('👥 Creating users...\n');
        for (const userData of seedUsers) {
            const user = await User.create(userData);
            console.log(`✅ Created: ${user.email} (${user.role})`);
        }

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 TEST ACCOUNTS:');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('🔐 ADMIN ACCOUNT:');
        console.log('   Email:    admin@ttdn.com');
        console.log('   Password: admin123\n');
        console.log('👤 USER ACCOUNTS:');
        console.log('   Email:    user@ttdn.com');
        console.log('   Password: user123\n');
        console.log('   Email:    test@ttdn.com');
        console.log('   Password: test123\n');
        console.log('═══════════════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedDatabase();
