// ═══════════════════════════════════════════════════════════════
// MODELS INDEX - Export all Mongoose models
// ═══════════════════════════════════════════════════════════════

export { User, UserRole, type IUser, type IAddress } from './User.model.js';

export { Category, type ICategory } from './Category.model.js';

export {
    Product,
    UnitOfMeasure,
    StorageType,
    type IProduct,
    type IProductImage,
} from './Product.model.js';

export {
    Recipe,
    RecipeDifficulty,
    type IRecipe,
    type IRecipeIngredient,
    type IRecipeStep,
} from './Recipe.model.js';

export {
    Order,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    type IOrder,
    type IOrderItem,
    type IOrderAddress,
    type IOrderTimeline,
} from './Order.model.js';

export { Voucher, VoucherType, type IVoucher } from './Voucher.model.js';

export {
    ChatMessage,
    MessageRole,
    type IChatMessage,
    type IMessageContext,
} from './ChatMessage.model.js';
