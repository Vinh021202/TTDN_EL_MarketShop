import { Request, Response } from 'express';
import { Recipe } from '../models/Recipe.model.js';
import { Product } from '../models/Product.model.js';

// ═══════════════════════════════════════════════════════════════
// GET /api/recipes
// Lấy danh sách công thức, filter theo mood / keyword / time
// ═══════════════════════════════════════════════════════════════
export const getRecipes = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = { isActive: true };

        // Mood tag filter (daily/quick/gym/healthy/rainy-day/comfort/family)
        if (req.query.mood) {
            filter.tags = { $in: [req.query.mood] };
        }

        // Max cooking time filter
        if (req.query.maxTime) {
            filter.cookTime = { $lte: parseInt(req.query.maxTime as string) };
        }

        // Difficulty filter
        if (req.query.difficulty) {
            filter.difficulty = req.query.difficulty;
        }

        // Text search
        let query;
        if (req.query.q) {
            query = Recipe.find(
                { ...filter, $text: { $search: req.query.q as string } },
                { score: { $meta: 'textScore' } }
            ).sort({ score: { $meta: 'textScore' } });
        } else {
            query = Recipe.find(filter).sort({ isFeatured: -1, viewCount: -1, createdAt: -1 });
        }

        const [recipes, total] = await Promise.all([
            query.skip(skip).limit(limit).select('-steps -ingredients -embedding'),
            Recipe.countDocuments(filter),
        ]);

        res.json({
            recipes,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('Get recipes error:', error);
        res.status(500).json({ error: 'Không thể tải danh sách công thức' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/recipes/featured
// Lấy top 6 công thức nổi bật
// ═══════════════════════════════════════════════════════════════
export const getFeaturedRecipes = async (_req: Request, res: Response) => {
    try {
        const recipes = await Recipe.find({ isActive: true, isFeatured: true })
            .sort({ viewCount: -1 })
            .limit(6)
            .select('-steps -embedding');

        // If fewer than 6 featured, fill with most viewed
        if (recipes.length < 6) {
            const ids = recipes.map((r) => r._id);
            const extra = await Recipe.find({ isActive: true, _id: { $nin: ids } })
                .sort({ viewCount: -1 })
                .limit(6 - recipes.length)
                .select('-steps -embedding');
            recipes.push(...extra);
        }

        res.json({ recipes });
    } catch (error: any) {
        console.error('Get featured recipes error:', error);
        res.status(500).json({ error: 'Không thể tải công thức nổi bật' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/recipes/:slug
// Chi tiết công thức + match sản phẩm từ DB
// ═══════════════════════════════════════════════════════════════
export const getRecipeBySlug = async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findOne({
            slug: req.params.slug,
            isActive: true,
        }).populate('ingredients.product', 'name price images unit slug stockQuantity');

        if (!recipe) {
            return res.status(404).json({ error: 'Không tìm thấy công thức' });
        }

        // Increment view count (non-blocking)
        Recipe.findByIdAndUpdate(recipe._id, { $inc: { viewCount: 1 } }).exec();

        // For ingredients WITHOUT a linked product, do a smart text search in Products
        const ingredientsWithMatches = await Promise.all(
            recipe.ingredients.map(async (ing: any) => {
                if (ing.product && ing.product._id) {
                    return { ...ing.toObject(), matchedProduct: ing.product };
                }
                // Try to find a matching product by name similarity
                const matched = await Product.findOne({
                    $text: { $search: ing.notes || '' },
                    isActive: true,
                    stockQuantity: { $gt: 0 },
                }).select('name price images unit slug stockQuantity');

                return { ...ing.toObject(), matchedProduct: matched || null };
            })
        );

        res.json({
            recipe: {
                ...recipe.toObject(),
                ingredients: ingredientsWithMatches,
            },
        });
    } catch (error: any) {
        console.error('Get recipe error:', error);
        res.status(500).json({ error: 'Không thể tải công thức' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/recipes/:id (by ID – cho admin)
// ═══════════════════════════════════════════════════════════════
export const getRecipeById = async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('ingredients.product', 'name price images unit');

        if (!recipe) {
            return res.status(404).json({ error: 'Không tìm thấy công thức' });
        }

        res.json({ recipe });
    } catch (error: any) {
        res.status(500).json({ error: 'Không thể tải công thức' });
    }
};
