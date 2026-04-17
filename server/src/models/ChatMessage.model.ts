import mongoose, { Schema, Document } from 'mongoose';

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export enum MessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
}

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface IMessageContext {
    cartItems?: Array<{
        productId: string;
        name: string;
        quantity: number;
    }>;
    currentPage?: string;
    userMood?: string; // Sentiment analysis result
    suggestedProducts?: string[];
    suggestedRecipes?: string[];
}

export interface IChatMessage extends Document {
    sessionId: string;
    user?: mongoose.Types.ObjectId;
    role: MessageRole;
    content: string;
    context?: IMessageContext;
    tokens?: number;
    createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════

const messageContextSchema = new Schema<IMessageContext>(
    {
        cartItems: [
            {
                productId: { type: String },
                name: { type: String },
                quantity: { type: Number },
            },
        ],
        currentPage: { type: String },
        userMood: { type: String },
        suggestedProducts: [{ type: String }],
        suggestedRecipes: [{ type: String }],
    },
    { _id: false }
);

const chatMessageSchema = new Schema<IChatMessage>(
    {
        sessionId: {
            type: String,
            required: [true, 'Session ID is required'],
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: Object.values(MessageRole),
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            maxlength: [10000, 'Message cannot exceed 10000 characters'],
        },
        context: {
            type: messageContextSchema,
        },
        tokens: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

// ═══════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // 30 days TTL

// ═══════════════════════════════════════════════════════════════
// MODEL
// ═══════════════════════════════════════════════════════════════

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
