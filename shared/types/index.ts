// ═══════════════════════════════════════════════════════════════
// SHARED TYPES - Used by both Client and Server
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// ENUMS
// ───────────────────────────────────────────────────────────────

export enum UserRole {
    CUSTOMER = 'customer',
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin',
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    SHIPPING = 'shipping',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum PaymentMethod {
    COD = 'cod',
    BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

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

export enum RecipeDifficulty {
    EASY = 'dễ',
    MEDIUM = 'trung bình',
    HARD = 'khó',
}

// ───────────────────────────────────────────────────────────────
// USER TYPES
// ───────────────────────────────────────────────────────────────

export interface IAddress {
    fullName: string;
    phone: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
    isDefault: boolean;
}

export interface IUser {
    _id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    addresses: IAddress[];
    wishlist: string[];
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

// ───────────────────────────────────────────────────────────────
// CATEGORY TYPES
// ───────────────────────────────────────────────────────────────

export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent?: string;
    order: number;
    isActive: boolean;
    subcategories?: ICategory[];
    createdAt: string;
    updatedAt: string;
}

// ───────────────────────────────────────────────────────────────
// PRODUCT TYPES
// ───────────────────────────────────────────────────────────────

export interface IProductImage {
    url: string;
    publicId?: string;
    alt?: string;
    isPrimary: boolean;
}

export interface IProduct {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    description?: string;
    shortDescription?: string;
    price: number;
    compareAtPrice?: number;
    category: string | ICategory;
    images: IProductImage[];
    stockQuantity: number;
    lowStockThreshold: number;
    unit: UnitOfMeasure;
    weightValue?: number;
    origin?: string;
    storageType: StorageType;
    expiryDate?: string;
    manufacturingDate?: string;
    isNearExpiry: boolean;
    tags: string[];
    isActive: boolean;
    isFeatured: boolean;
    soldCount: number;
    viewCount: number;
    // Computed
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    discountPercentage?: number;
    createdAt: string;
    updatedAt: string;
}

// ───────────────────────────────────────────────────────────────
// RECIPE TYPES
// ───────────────────────────────────────────────────────────────

export interface IRecipeIngredient {
    product: string | IProduct;
    quantity: number;
    unit: string;
    isOptional: boolean;
    notes?: string;
}

export interface IRecipeStep {
    order: number;
    instruction: string;
    duration?: number;
    image?: string;
    tips?: string;
}

export interface IRecipe {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    video?: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: RecipeDifficulty;
    ingredients: IRecipeIngredient[];
    steps: IRecipeStep[];
    tags: string[];
    estimatedCost?: number;
    calories?: number;
    isActive: boolean;
    isFeatured: boolean;
    viewCount: number;
    saveCount: number;
    // Computed
    totalTime?: number;
    createdAt: string;
    updatedAt: string;
}

// ───────────────────────────────────────────────────────────────
// ORDER TYPES
// ───────────────────────────────────────────────────────────────

export interface IOrderItem {
    product: string | IProduct;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface IOrderAddress {
    fullName: string;
    phone: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
}

export interface IOrderTimeline {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface IOrder {
    _id: string;
    orderNumber: string;
    user: string | IUser;
    items: IOrderItem[];
    shippingAddress: IOrderAddress;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    notes?: string;
    sepayTransactionId?: string;
    timeline: IOrderTimeline[];
    createdAt: string;
    updatedAt: string;
}

// ───────────────────────────────────────────────────────────────
// CART TYPES (Client-side only)
// ───────────────────────────────────────────────────────────────

export interface ICartItem {
    product: IProduct;
    quantity: number;
    addedAt: string;
}

export interface ICart {
    items: ICartItem[];
    subtotal: number;
    itemCount: number;
    reservationExpiresAt?: string;
}

// ───────────────────────────────────────────────────────────────
// API RESPONSE TYPES
// ───────────────────────────────────────────────────────────────

export interface IApiError {
    error: string;
    message?: string;
    statusCode?: number;
}

export interface IPaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface IAuthResponse {
    user: IUser;
    token: string;
    expiresIn: string;
}
