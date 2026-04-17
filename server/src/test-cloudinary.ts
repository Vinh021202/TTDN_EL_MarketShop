import 'dotenv/config';
import { testCloudinaryConnection } from './utils/cloudinary.js';

// ═══════════════════════════════════════════════════════════════
// TEST CLOUDINARY CONNECTION
// ═══════════════════════════════════════════════════════════════

async function testConnection() {
    console.log('\n🔍 Testing Cloudinary connection...\n');

    const isConnected = await testCloudinaryConnection();

    if (isConnected) {
        console.log('\n✅ Cloudinary is configured correctly!');
        console.log(`📁 Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);
    } else {
        console.log('\n❌ Cloudinary connection failed!');
        console.log('Please check your .env file:\n');
        console.log('  CLOUDINARY_CLOUD_NAME=your-cloud-name');
        console.log('  CLOUDINARY_API_KEY=your-api-key');
        console.log('  CLOUDINARY_API_SECRET=your-api-secret\n');
    }

    process.exit(isConnected ? 0 : 1);
}

testConnection();
