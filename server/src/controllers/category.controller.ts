import { Request, Response } from 'express';
import { Category } from '../models/Category.model.js';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const createCategorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().url().optional(),
    parent: z.string().optional(), // Parent category ID
    order: z.number().int().nonnegative().optional(),
});

// ═══════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/categories
 * Get all categories (nested tree structure)
 */
export const getAllCategories = async (_req: Request, res: Response) => {
    try {
        // Fetch all active categories
        const categories = await Category.find({ isActive: true })
            .populate('subcategories')
            .sort({ order: 1, name: 1 })
            .lean();

        // Build tree structure (only return root categories, subcategories are populated)
        const rootCategories = categories.filter((cat: any) => !cat.parent);

        res.json({ categories: rootCategories });
    } catch (error: any) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

/**
 * GET /api/categories/:id
 * Get category by ID with products count
 */
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parent', 'name slug')
            .populate('subcategories')
            .lean();

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Count products in this category
        const { Product } = await import('../models/Product.model.js');
        const productsCount = await Product.countDocuments({
            category: req.params.id,
            isActive: true,
        });

        res.json({
            category: {
                ...category,
                productsCount,
            },
        });
    } catch (error: any) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
};

/**
 * POST /api/categories
 * Create new category (Admin only)
 */
export const createCategory = async (req: Request, res: Response) => {
    try {
        const validated = createCategorySchema.parse(req.body);

        // Check if slug already exists
        const existing = await Category.findOne({ slug: validated.slug });
        if (existing) {
            return res.status(400).json({ error: 'Category with this slug already exists' });
        }

        const category = await Category.create(validated);

        res.status(201).json({ category });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};

/**
 * PUT /api/categories/:id
 * Update category (Admin only)
 */
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const validated = createCategorySchema.partial().parse(req.body);

        // If slug is being updated, check uniqueness
        if (validated.slug) {
            const existing = await Category.findOne({
                slug: validated.slug,
                _id: { $ne: req.params.id },
            });
            if (existing) {
                return res.status(400).json({ error: 'Category with this slug already exists' });
            }
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: validated },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ category });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

/**
 * DELETE /api/categories/:id
 * Soft delete category (Admin only)
 */
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        // Check if category has products
        const { Product } = await import('../models/Product.model.js');
        const productsCount = await Product.countDocuments({
            category: req.params.id,
            isActive: true,
        });

        if (productsCount > 0) {
            return res.status(400).json({
                error: `Cannot delete category with ${productsCount} active products`,
            });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};
