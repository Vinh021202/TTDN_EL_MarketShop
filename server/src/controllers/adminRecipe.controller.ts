import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Recipe, RecipeDifficulty } from '../models/Recipe.model.js';

const recipeDifficulties = new Set(Object.values(RecipeDifficulty));

const slugifyRecipeName = (value: string) => {
    const normalized = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return normalized || `recipe-${Date.now()}`;
};

const parseBoolean = (value: unknown, fallback: boolean) => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) {
            return true;
        }

        if (['false', '0', 'no', 'off'].includes(normalized)) {
            return false;
        }
    }

    return fallback;
};

const parseOptionalNumber = (value: unknown) => {
    if (value === '' || value === null || value === undefined) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeTags = (tags: unknown) => {
    if (Array.isArray(tags)) {
        return tags
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }

    if (typeof tags === 'string') {
        return tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeIngredients = (ingredients: unknown) => {
    if (!Array.isArray(ingredients)) {
        return [];
    }

    return ingredients.reduce<
        Array<{
            product: string;
            quantity: number;
            unit: string;
            isOptional: boolean;
            notes?: string;
        }>
    >((result, ingredient) => {
            const productId =
                typeof ingredient?.product === 'string'
                    ? ingredient.product
                    : ingredient?.product?._id || '';
            const quantity = Number(ingredient?.quantity);

            if (!mongoose.Types.ObjectId.isValid(productId) || !Number.isFinite(quantity) || quantity <= 0) {
                return result;
            }

            result.push({
                product: productId,
                quantity,
                unit: String(ingredient?.unit || '').trim() || 'phần',
                isOptional: parseBoolean(ingredient?.isOptional, false),
                notes: String(ingredient?.notes || '').trim() || undefined,
            });

            return result;
        }, []);
};

const normalizeSteps = (steps: unknown) => {
    if (!Array.isArray(steps)) {
        return [];
    }

    return steps.reduce<
        Array<{
            order: number;
            instruction: string;
            duration?: number;
            image?: string;
            tips?: string;
        }>
    >((result, step, index) => {
            const instruction = String(step?.instruction || '').trim();

            if (!instruction) {
                return result;
            }

            const duration = parseOptionalNumber(step?.duration);

            result.push({
                order: index + 1,
                instruction,
                duration,
                image: String(step?.image || '').trim() || undefined,
                tips: String(step?.tips || '').trim() || undefined,
            });

            return result;
        }, []);
};

const ensureUniqueSlug = async (baseSlug: string, excludedId?: string) => {
    let slug = baseSlug;
    let counter = 1;

    while (
        await Recipe.exists({
            slug,
            ...(excludedId ? { _id: { $ne: excludedId } } : {}),
        })
    ) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }

    return slug;
};

const buildRecipePayload = async (body: Record<string, any>, excludedId?: string) => {
    const name = String(body.name || '').trim();

    if (!name) {
        return { error: 'Tên công thức là bắt buộc.' };
    }

    const ingredients = normalizeIngredients(body.ingredients);
    if (!ingredients.length) {
        return { error: 'Công thức cần ít nhất một nguyên liệu hợp lệ.' };
    }

    const steps = normalizeSteps(body.steps);
    if (!steps.length) {
        return { error: 'Công thức cần ít nhất một bước thực hiện.' };
    }

    const difficulty = recipeDifficulties.has(body.difficulty)
        ? body.difficulty
        : RecipeDifficulty.MEDIUM;
    const baseSlug = slugifyRecipeName(String(body.slug || name));
    const slug = await ensureUniqueSlug(baseSlug, excludedId);

    return {
        payload: {
            name,
            slug,
            description: String(body.description || '').trim() || undefined,
            thumbnail: String(body.thumbnail || '').trim() || undefined,
            video: String(body.video || '').trim() || undefined,
            prepTime: Math.max(0, Number(body.prepTime) || 0),
            cookTime: Math.max(0, Number(body.cookTime) || 0),
            servings: Math.max(1, Number(body.servings) || 1),
            difficulty,
            ingredients,
            steps,
            tags: normalizeTags(body.tags),
            estimatedCost: parseOptionalNumber(body.estimatedCost),
            calories: parseOptionalNumber(body.calories),
            isActive: parseBoolean(body.isActive, true),
            isFeatured: parseBoolean(body.isFeatured, false),
        },
    };
};

export const getAllAdminRecipes = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 15));
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};
        const search = String(req.query.search || '').trim();
        const difficulty = String(req.query.difficulty || '').trim();
        const active = req.query.active;
        const featured = req.query.featured;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
            ];
        }

        if (difficulty && recipeDifficulties.has(difficulty as RecipeDifficulty)) {
            filter.difficulty = difficulty;
        }

        if (active !== undefined) {
            filter.isActive = parseBoolean(active, true);
        }

        if (featured !== undefined) {
            filter.isFeatured = parseBoolean(featured, false);
        }

        const [recipes, total] = await Promise.all([
            Recipe.find(filter)
                .populate('ingredients.product', 'name unit')
                .sort({ updatedAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-embedding'),
            Recipe.countDocuments(filter),
        ]);

        res.json({
            recipes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Admin get recipes error:', error);
        res.status(500).json({ error: 'Không thể tải danh sách công thức.' });
    }
};

export const getAdminRecipeById = async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('ingredients.product', 'name unit images price')
            .select('-embedding');

        if (!recipe) {
            return res.status(404).json({ error: 'Không tìm thấy công thức.' });
        }

        res.json({ recipe });
    } catch (error) {
        console.error('Admin get recipe detail error:', error);
        res.status(500).json({ error: 'Không thể tải chi tiết công thức.' });
    }
};

export const createAdminRecipe = async (req: Request, res: Response) => {
    try {
        const result = await buildRecipePayload(req.body || {});
        if ('error' in result) {
            return res.status(400).json({ error: result.error });
        }

        const created = await Recipe.create(result.payload);
        const recipe = await Recipe.findById(created._id)
            .populate('ingredients.product', 'name unit images price')
            .select('-embedding');

        res.status(201).json({ recipe });
    } catch (error: any) {
        console.error('Admin create recipe error:', error);
        res.status(500).json({ error: error?.message || 'Không thể tạo công thức.' });
    }
};

export const updateAdminRecipe = async (req: Request, res: Response) => {
    try {
        const existing = await Recipe.findById(req.params.id);

        if (!existing) {
            return res.status(404).json({ error: 'Không tìm thấy công thức.' });
        }

        const result = await buildRecipePayload(req.body || {}, req.params.id);
        if ('error' in result) {
            return res.status(400).json({ error: result.error });
        }

        existing.set(result.payload);
        await existing.save();

        const recipe = await Recipe.findById(existing._id)
            .populate('ingredients.product', 'name unit images price')
            .select('-embedding');

        res.json({ recipe });
    } catch (error: any) {
        console.error('Admin update recipe error:', error);
        res.status(500).json({ error: error?.message || 'Không thể cập nhật công thức.' });
    }
};

export const deleteAdminRecipe = async (req: Request, res: Response) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!recipe) {
            return res.status(404).json({ error: 'Không tìm thấy công thức.' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete recipe error:', error);
        res.status(500).json({ error: 'Không thể xóa công thức.' });
    }
};
