import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/User.model.js';
import { Category } from './models/Category.model.js';
import { Product } from './models/Product.model.js';

// ═══════════════════════════════════════════════════════════════
// VERIFY DATABASE DATA
// ═══════════════════════════════════════════════════════════════

async function verifyData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('\n✅ Connected to MongoDB\n');

        // Count collections
        const userCount = await User.countDocuments();
        const categoryCount = await Category.countDocuments();
        const productCount = await Product.countDocuments();

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📊 DATABASE SUMMARY');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`   👥 Users: ${userCount}`);
        console.log(`   📁 Categories: ${categoryCount}`);
        console.log(`   📦 Products: ${productCount}\n`);

        // Show categories
        const categories = await Category.find().select('name slug');
        console.log('📁 Categories:');
        categories.forEach((cat) => {
            console.log(`   - ${cat.name} (${cat.slug})`);
        });
        console.log('');

        // Show product distribution by category
        console.log('📊 Products by Category:');
        for (const cat of categories) {
            const count = await Product.countDocuments({ category: cat._id });
            console.log(`   - ${cat.name}: ${count} products`);
        }
        console.log('');

        // Sample products
        const sampleProducts = await Product.find().populate('category').limit(5);
        console.log('📦 Sample Products:');
        sampleProducts.forEach((product) => {
            console.log(`   - ${product.name}`);
            console.log(`     SKU: ${product.sku}, Price: ${product.price.toLocaleString('vi-VN')}đ`);
            console.log(`     Category: ${(product.category as any).name}`);
            console.log(`     Stock: ${product.stockQuantity}, Unit: ${product.unit}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyData();
