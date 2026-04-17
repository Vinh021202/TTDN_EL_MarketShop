import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { Recipe, RecipeDifficulty } from '../models/Recipe.model.js';
import {
    fetchRecipeThumbnailAssets,
    findRecipeThumbnailBySlug,
} from '../utils/recipeThumbnails.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const moodTagMap: Record<string, string[]> = {
    daily: ['daily', 'Hang ngay'],
    quick: ['quick', 'Nhanh'],
    gym: ['gym', 'The hinh'],
    healthy: ['healthy', 'Lanh manh'],
    'rainy-day': ['rainy-day', 'Mua'],
    comfort: ['comfort', 'Am ap'],
    family: ['family', 'Gia dinh'],
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function estimateDifficulty(steps: string[], time: number): RecipeDifficulty {
    if (steps.length <= 4 && time <= 15) return RecipeDifficulty.EASY;
    if (steps.length >= 7 || time >= 40) return RecipeDifficulty.HARD;
    return RecipeDifficulty.MEDIUM;
}

function readRecipesJson() {
    const primaryPath = join(__dirname, '../../../../recipes.json');
    const fallbackPath = join(__dirname, '../../../recipes.json');

    try {
        return JSON.parse(readFileSync(primaryPath, 'utf-8')) as any[];
    } catch {
        return JSON.parse(readFileSync(fallbackPath, 'utf-8')) as any[];
    }
}

async function seed() {
    await connectDatabase();
    const recipeThumbnailAssets = await fetchRecipeThumbnailAssets();
    const rawRecipes = readRecipesJson();

    console.log(`Loaded ${rawRecipes.length} recipes from JSON`);

    let created = 0;
    let skipped = 0;

    for (const raw of rawRecipes) {
        const slug = slugify(raw.name);
        const exists = await Recipe.findOne({ slug });
        if (exists) {
            skipped += 1;
            continue;
        }

        const tags = (raw.mood_tags || []).flatMap((mood: string) => moodTagMap[mood] || []);

        const steps = (raw.steps || []).map((instruction: string, index: number) => ({
            order: index + 1,
            instruction,
        }));

        const ingredients = (raw.ingredients || []).map((ingredient: any) => ({
            product: new mongoose.Types.ObjectId(),
            quantity: 1,
            unit: ingredient.qty || '',
            isOptional: false,
            notes: ingredient.name,
        }));

        const cookTime = raw.cooking_time_min || 20;
        const prepTime = Math.round(cookTime * 0.3);
        const thumbnailAsset = findRecipeThumbnailBySlug(slug, recipeThumbnailAssets);

        await Recipe.create({
            name: raw.name,
            slug,
            description: `Huong dan nau ${raw.name} ngon tai nha voi nguyen lieu de tim. Thoi gian nau khoang ${cookTime} phut.`,
            thumbnail: thumbnailAsset?.url,
            prepTime,
            cookTime,
            servings: 2,
            difficulty: estimateDifficulty(raw.steps || [], cookTime),
            ingredients,
            steps,
            tags: [...new Set(tags)],
            isActive: true,
            isFeatured: raw.mood_tags?.includes('family') || raw.mood_tags?.includes('comfort'),
        });

        created += 1;
        process.stdout.write(`Created: ${raw.name}\n`);
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
    process.exit(0);
}

seed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});
