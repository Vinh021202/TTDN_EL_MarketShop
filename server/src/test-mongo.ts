import 'dotenv/config';
import mongoose from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// TEST MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════════

async function testConnection() {
    console.log('\n🔍 Testing MongoDB connection...\n');

    const mongoUri = process.env.MONGODB_URI || '';

    if (!mongoUri || mongoUri.includes('<user>') || mongoUri.includes('<password>')) {
        console.log('❌ MongoDB URI not configured!\n');
        console.log('Please update .env file with your connection string:');
        console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce_shop\n');
        console.log('📖 See MONGODB_SETUP.md for full setup guide.\n');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);

        const db = mongoose.connection.db;
        const admin = db!.admin();
        const serverStatus = await admin.serverStatus();

        console.log('✅ MongoDB connected successfully!\\n');
        console.log('Connection Details:');
        console.log(`   📁 Database: ${db!.databaseName}`);
        console.log(`   🌐 Host: ${serverStatus.host}`);
        console.log(`   📊 Version: ${serverStatus.version}`);
        console.log(`   ⏱️  Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes\\n`);

        console.log('\\n2. Testing Query Execution...');
        const sampleProducts = await db!.collection('products').find({}).limit(5).toArray();
        console.log('- Successfully fetched', sampleProducts.length, 'products');

        console.log('\\n3. Testing Index Information...');
        console.log('- Creating test index on "name" field (if not exists)...');
        await db!.collection('products').createIndex({ name: 1 });

        // Test write permission
        const testCollection = db!.collection('test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        await testCollection.deleteOne({ test: true });

        console.log('✅ Write permissions verified!\\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ MongoDB connection failed!\n');
        console.error('Error:', error.message);
        console.log('\n💡 Common Issues:');
        console.log('   1. Check username/password in connection string');
        console.log('   2. Whitelist your IP in MongoDB Atlas (Network Access)');
        console.log('   3. Make sure database user has correct privileges\n');
        console.log('📖 See MONGODB_SETUP.md for troubleshooting.\n');
        process.exit(1);
    }
}

testConnection();
