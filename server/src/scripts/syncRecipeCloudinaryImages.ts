import 'dotenv/config';
import mongoose from 'mongoose';
import { Recipe } from '../models/Recipe.model.js';
import {
    fetchRecipeThumbnailAssets,
    findRecipeThumbnailBySlug,
} from '../utils/recipeThumbnails.js';

async function syncRecipeCloudinaryImages() {
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri || mongoUri.includes('<user>')) {
        throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(mongoUri);

    const recipeThumbnailAssets = await fetchRecipeThumbnailAssets();
    const recipes = await Recipe.find({});

    let updatedCount = 0;
    let skippedCount = 0;
    let missingCount = 0;

    for (const recipe of recipes) {
        const thumbnailAsset = findRecipeThumbnailBySlug(recipe.slug, recipeThumbnailAssets);

        if (!thumbnailAsset) {
            missingCount += 1;
            console.log(`Missing thumbnail for ${recipe.slug}`);
            continue;
        }

        if (recipe.thumbnail === thumbnailAsset.url) {
            skippedCount += 1;
            continue;
        }

        recipe.thumbnail = thumbnailAsset.url;
        await recipe.save();
        updatedCount += 1;
        console.log(`Updated ${recipe.slug} -> ${thumbnailAsset.publicId}`);
    }

    const recipesWithoutThumbnail = await Recipe.countDocuments({
        $or: [{ thumbnail: { $exists: false } }, { thumbnail: '' }, { thumbnail: null }],
    });

    console.log('\nSync complete');
    console.log(`Updated recipes: ${updatedCount}`);
    console.log(`Skipped recipes: ${skippedCount}`);
    console.log(`Missing Cloudinary match: ${missingCount}`);
    console.log(`Recipes without thumbnail: ${recipesWithoutThumbnail}`);
}

syncRecipeCloudinaryImages()
    .then(async () => {
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(async (error: any) => {
        console.error('Failed to sync recipe images:', error.message);
        console.error(error);
        await mongoose.disconnect().catch(() => undefined);
        process.exit(1);
    });
