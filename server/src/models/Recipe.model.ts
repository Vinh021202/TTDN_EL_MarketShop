import mongoose, { Schema, Document } from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export enum RecipeDifficulty {
    EASY = 'dễ',
    MEDIUM = 'trung bình',
    HARD = 'khó',
}

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface IRecipeIngredient {
    product: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
    isOptional: boolean;
    notes?: string;
}

export interface IRecipeStep {
    order: number;
    instruction: string;
    duration?: number; // In minutes
    image?: string;
    tips?: string;
}

export interface IRecipe extends Document {
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    video?: string;
    prepTime: number; // In minutes
    cookTime: number;
    servings: number;
    difficulty: RecipeDifficulty;
    ingredients: IRecipeIngredient[];
    steps: IRecipeStep[];
    tags: string[];
    embedding?: number[]; // Vector for AI search
    estimatedCost?: number;
    calories?: number;
    isActive: boolean;
    isFeatured: boolean;
    viewCount: number;
    saveCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════

const recipeIngredientSchema = new Schema<IRecipeIngredient>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [0, 'Quantity cannot be negative'],
        },
        unit: {
            type: String,
            required: true,
            trim: true,
        },
        isOptional: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const recipeStepSchema = new Schema<IRecipeStep>(
    {
        order: {
            type: Number,
            required: true,
        },
        instruction: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: Number,
            min: [0, 'Duration cannot be negative'],
        },
        image: {
            type: String,
        },
        tips: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const recipeSchema = new Schema<IRecipe>(
    {
        name: {
            type: String,
            required: [true, 'Recipe name is required'],
            trim: true,
            maxlength: [200, 'Recipe name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        thumbnail: {
            type: String,
        },
        video: {
            type: String,
        },
        prepTime: {
            type: Number,
            required: [true, 'Prep time is required'],
            min: [0, 'Prep time cannot be negative'],
        },
        cookTime: {
            type: Number,
            required: [true, 'Cook time is required'],
            min: [0, 'Cook time cannot be negative'],
        },
        servings: {
            type: Number,
            required: true,
            default: 2,
            min: [1, 'Servings must be at least 1'],
        },
        difficulty: {
            type: String,
            enum: Object.values(RecipeDifficulty),
            default: RecipeDifficulty.MEDIUM,
        },
        ingredients: [recipeIngredientSchema],
        steps: [recipeStepSchema],
        tags: [{ type: String, trim: true }],
        // Vector embedding for AI-powered search
        embedding: {
            type: [Number],
            select: false,
        },
        estimatedCost: {
            type: Number, // VND - Integer
        },
        calories: {
            type: Number,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        saveCount: {
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

// Total time
recipeSchema.virtual('totalTime').get(function () {
    return this.prepTime + this.cookTime;
});

// ═══════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════

recipeSchema.index({ slug: 1 });
recipeSchema.index({ isActive: 1, isFeatured: -1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ 'ingredients.product': 1 });
recipeSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search

// ═══════════════════════════════════════════════════════════════
// MODEL
// ═══════════════════════════════════════════════════════════════

export const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);
