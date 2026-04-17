import { Request, Response } from 'express';
import { z } from 'zod';
import {
    Product,
    IProductImage,
    StorageType,
    UnitOfMeasure,
} from '../models/Product.model.js';

const productImageInputSchema = z.union([
    z.string().url(),
    z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        alt: z.string().optional(),
        isPrimary: z.boolean().optional(),
    }),
]);

const createProductSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    shortDescription: z.string().max(300, 'Short description cannot exceed 300 characters').optional(),
    price: z.number().int().positive('Price must be positive integer (VND)'),
    compareAtPrice: z.number().int().nonnegative('Compare at price cannot be negative').optional(),
    stock: z.number().int().nonnegative('Stock cannot be negative').optional(),
    stockQuantity: z.number().int().nonnegative('Stock cannot be negative').optional(),
    unit: z.string().min(1, 'Unit is required'),
    sku: z.string().optional(),
    category: z.string(),
    images: z.array(productImageInputSchema).min(1, 'At least one image required'),
    tags: z.array(z.string()).optional(),
    origin: z.string().optional(),
    storageType: z.string().optional(),
    expiryDate: z.string().optional(),
    manufacturingDate: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
});

type CreateProductInput = z.infer<typeof createProductSchema>;

const unitMap: Record<string, UnitOfMeasure> = {
    kg: UnitOfMeasure.KG,
    gram: UnitOfMeasure.GRAM,
    pack: UnitOfMeasure.PACK,
    bundle: UnitOfMeasure.BUNDLE,
    carton: UnitOfMeasure.CARTON,
    piece: UnitOfMeasure.PIECE,
    liter: UnitOfMeasure.LITER,
    lít: UnitOfMeasure.LITER,
    gói: UnitOfMeasure.PACK,
    bó: UnitOfMeasure.BUNDLE,
    thùng: UnitOfMeasure.CARTON,
    cái: UnitOfMeasure.PIECE,
};

const storageTypeMap: Record<string, StorageType> = {
    'room_temp': StorageType.ROOM_TEMP,
    roomtemp: StorageType.ROOM_TEMP,
    'nhiệt độ thường': StorageType.ROOM_TEMP,
    'refrigerator': StorageType.REFRIGERATOR,
    'ngăn mát': StorageType.REFRIGERATOR,
    'freezer': StorageType.FREEZER,
    'ngăn đông': StorageType.FREEZER,
};

function slugify(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function generateSku(name: string): string {
    const base = slugify(name).replace(/-/g, '').slice(0, 8).toUpperCase() || 'PRODUCT';
    const suffix = Date.now().toString().slice(-6);
    return `PRD-${base}-${suffix}`;
}

function normalizeUnit(unit: string): UnitOfMeasure {
    const normalizedUnit = unitMap[unit.trim().toLowerCase()];
    return normalizedUnit || UnitOfMeasure.PIECE;
}

function normalizeStorageType(storageType?: string): StorageType {
    if (!storageType?.trim()) {
        return StorageType.ROOM_TEMP;
    }

    const normalizedStorageType = storageTypeMap[storageType.trim().toLowerCase()];
    return normalizedStorageType || StorageType.ROOM_TEMP;
}

function extractCloudinaryPublicIdFromUrl(url: string): string | undefined {
    const match = url.match(/\/upload\/(?:[^/]+\/)*v\d+\/(.+?)(?:\.[a-z0-9]+)?$/i);
    if (match?.[1]) {
        return match[1];
    }

    const fallbackMatch = url.match(/\/upload\/(?:[^/]+\/)*(.+?)(?:\.[a-z0-9]+)?$/i);
    return fallbackMatch?.[1];
}

function normalizeProductImages(
    images: CreateProductInput['images'],
    productName: string
): IProductImage[] {
    return images
        .map((image, index) => {
            if (typeof image === 'string') {
                return {
                    url: image,
                    publicId: extractCloudinaryPublicIdFromUrl(image),
                    alt: productName,
                    isPrimary: index === 0,
                };
            }

            return {
                url: image.url,
                publicId: image.publicId || extractCloudinaryPublicIdFromUrl(image.url),
                alt: image.alt || productName,
                isPrimary: index === 0,
            };
        })
        .filter((image) => Boolean(image.url));
}

function buildProductPayload(
    input: Partial<CreateProductInput>,
    existing?: { name: string; sku: string }
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const nextName = input.name?.trim() || existing?.name || 'product';
    const nextSku = (input.sku?.trim() || existing?.sku || generateSku(nextName)).toUpperCase();

    if (input.name !== undefined) {
        payload.name = nextName;
    }

    if (!existing || input.name !== undefined || input.sku !== undefined) {
        payload.slug = `${slugify(nextName)}-${nextSku.toLowerCase()}`;
    }

    if (!existing || input.sku !== undefined) {
        payload.sku = nextSku;
    }

    if (input.description !== undefined) {
        payload.description = input.description.trim();
    }

    if (input.shortDescription !== undefined) {
        payload.shortDescription = input.shortDescription.trim() || undefined;
    } else if (!existing && input.description) {
        payload.shortDescription = input.description.trim().slice(0, 300) || undefined;
    }

    if (input.price !== undefined) {
        payload.price = input.price;
    }

    if (input.compareAtPrice !== undefined) {
        payload.compareAtPrice = input.compareAtPrice;
    }

    const nextStockQuantity = input.stockQuantity ?? input.stock;
    if (nextStockQuantity !== undefined) {
        payload.stockQuantity = nextStockQuantity;
    }

    if (input.unit !== undefined) {
        payload.unit = normalizeUnit(input.unit);
    }

    if (input.category !== undefined) {
        payload.category = input.category;
    }

    if (input.images !== undefined) {
        payload.images = normalizeProductImages(input.images, nextName);
    }

    if (input.tags !== undefined) {
        payload.tags = input.tags.map((tag) => tag.trim()).filter(Boolean);
    }

    if (input.origin !== undefined) {
        payload.origin = input.origin.trim() || undefined;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'storageType')) {
        payload.storageType = normalizeStorageType(input.storageType);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'expiryDate')) {
        payload.expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'manufacturingDate')) {
        payload.manufacturingDate = input.manufacturingDate
            ? new Date(input.manufacturingDate)
            : null;
    }

    if (input.isActive !== undefined) {
        payload.isActive = input.isActive;
    }

    if (input.isFeatured !== undefined) {
        payload.isFeatured = input.isFeatured;
    }

    return payload;
}

function respondWithValidationError(res: Response, error: unknown): boolean {
    if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return true;
    }

    if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
    ) {
        res.status(400).json({ error: 'SKU hoặc slug đã tồn tại' });
        return true;
    }

    return false;
}

/**
 * GET /api/products
 * Get all products with pagination, filter, search
 */
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        const filter: Record<string, unknown> = { isActive: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                (filter.price as Record<string, number>).$gte = parseInt(req.query.minPrice as string);
            }
            if (req.query.maxPrice) {
                (filter.price as Record<string, number>).$lte = parseInt(req.query.maxPrice as string);
            }
        }

        if (req.query.unit) {
            filter.unit = req.query.unit;
        }

        if (req.query.tags) {
            filter.tags = { $in: (req.query.tags as string).split(',') };
        }

        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        let sort: Record<string, 1 | -1> = { createdAt: -1 };
        if (req.query.sort === 'price_asc') sort = { price: 1 };
        else if (req.query.sort === 'price_desc') sort = { price: -1 };
        else if (req.query.sort === 'name') sort = { name: 1 };

        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(filter);

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const enhancedProducts = products.map((product: any) => ({
            ...product,
            isNearExpiry:
                product.expiryDate && new Date(product.expiryDate) <= threeDaysFromNow,
        }));

        res.json({
            products: enhancedProducts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

/**
 * GET /api/products/:id
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug description')
            .lean();

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const isNearExpiry =
            product.expiryDate && new Date(product.expiryDate) <= threeDaysFromNow;

        res.json({
            product: {
                ...product,
                isNearExpiry,
            },
        });
    } catch (error: any) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

/**
 * POST /api/products
 * Create new product (Admin only)
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const validated = createProductSchema.parse(req.body);
        const payload = buildProductPayload(validated);
        const product = await Product.create(payload);

        res.status(201).json({ product });
    } catch (error: any) {
        if (respondWithValidationError(res, error)) {
            return;
        }

        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

/**
 * PUT /api/products/:id
 * Update product (Admin only)
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const existingProduct = await Product.findById(req.params.id).select('name sku');
        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const validated = createProductSchema.partial().parse(req.body);
        const payload = buildProductPayload(validated, {
            name: existingProduct.name,
            sku: existingProduct.sku,
        });

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: payload },
            { new: true, runValidators: true }
        );

        res.json({ product });
    } catch (error: any) {
        if (respondWithValidationError(res, error)) {
            return;
        }

        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

/**
 * DELETE /api/products/:id
 * Soft delete product (Admin only)
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
