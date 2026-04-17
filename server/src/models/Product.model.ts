import mongoose, { Schema, Document } from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export enum UnitOfMeasure {
    KG = 'kg',
    GRAM = 'gram',
    PACK = 'gói',
    BUNDLE = 'bó',
    CARTON = 'thùng',
    PIECE = 'cái',
    LITER = 'lít',
}

export enum StorageType {
    ROOM_TEMP = 'nhiệt độ thường',
    REFRIGERATOR = 'ngăn mát',
    FREEZER = 'ngăn đông',
}

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface IProductImage {
    url: string;
    publicId?: string;
    alt?: string;
    isPrimary: boolean;
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    sku: string;
    description?: string;
    shortDescription?: string;
    price: number; // Stored as Integer (VND) - No decimals for Vietnamese currency
    compareAtPrice?: number;
    costPerItem?: number;
    category: mongoose.Types.ObjectId;
    images: IProductImage[];
    stockQuantity: number;
    lowStockThreshold: number;
    unit: UnitOfMeasure;
    weightValue?: number;
    origin?: string;
    storageType: StorageType;
    expiryDate?: Date;
    manufacturingDate?: Date;
    isNearExpiry: boolean;
    embedding?: number[]; // Vector for AI search
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    soldCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════

const productImageSchema = new Schema<IProductImage>(
    {
        url: { type: String, required: true },
        publicId: { type: String },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: false }
);

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        shortDescription: {
            type: String,
            maxlength: [300, 'Short description cannot exceed 300 characters'],
        },
        // Price stored as INTEGER (VND) - Following business.md rule: No Float for currency
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Price must be an integer (VND)',
            },
        },
        compareAtPrice: {
            type: Number,
            min: [0, 'Compare at price cannot be negative'],
        },
        costPerItem: {
            type: Number,
            min: [0, 'Cost cannot be negative'],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        images: [productImageSchema],
        stockQuantity: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Stock cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Stock quantity must be an integer',
            },
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
        },
        unit: {
            type: String,
            enum: Object.values(UnitOfMeasure),
            default: UnitOfMeasure.PIECE,
        },
        weightValue: {
            type: Number,
            min: [0, 'Weight cannot be negative'],
        },
        origin: {
            type: String,
            trim: true,
        },
        storageType: {
            type: String,
            enum: Object.values(StorageType),
            default: StorageType.ROOM_TEMP,
        },
        expiryDate: {
            type: Date,
        },
        manufacturingDate: {
            type: Date,
        },
        isNearExpiry: {
            type: Boolean,
            default: false,
        },
        // Vector embedding for AI-powered search (MongoDB Atlas Vector Search)
        embedding: {
            type: [Number],
            select: false, // Don't include in normal queries
        },
        tags: [{ type: String, trim: true }],
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        soldCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ═══════════════════════════════════════════════════════════════
// VIRTUALS
// ═══════════════════════════════════════════════════════════════

// Check if low stock
productSchema.virtual('isLowStock').get(function () {
    return this.stockQuantity <= this.lowStockThreshold;
});

// Check if out of stock
productSchema.virtual('isOutOfStock').get(function () {
    return this.stockQuantity === 0;
});

// Get discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Auto-calculate isNearExpiry (< 3 days)
productSchema.pre('save', function (next) {
    if (this.expiryDate) {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        this.isNearExpiry = this.expiryDate <= threeDaysFromNow;
    }
    next();
});

// ═══════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════

productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: -1 });
productSchema.index({ price: 1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search

// ═══════════════════════════════════════════════════════════════
// MODEL
// ═══════════════════════════════════════════════════════════════

export const Product = mongoose.model<IProduct>('Product', productSchema);
