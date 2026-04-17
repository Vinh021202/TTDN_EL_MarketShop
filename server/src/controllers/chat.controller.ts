import { Request, Response } from 'express';
import { ChatMessage, MessageRole } from '../models/ChatMessage.model.js';
import { Product } from '../models/Product.model.js';
import { Recipe } from '../models/Recipe.model.js';

const DASHSCOPE_BASE_URL =
    process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';
const DASHSCOPE_MODEL = process.env.DASHSCOPE_MODEL || 'qwen-plus';
const MAX_HISTORY_MESSAGES = 10;

type OpenAICompatibleMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

function ensureTrailingSlash(value: string) {
    return value.endsWith('/') ? value : `${value}/`;
}

function extractAssistantText(payload: any) {
    const content = payload?.choices?.[0]?.message?.content;

    if (typeof content === 'string' && content.trim()) {
        return content.trim();
    }

    if (Array.isArray(content)) {
        const text = content
            .map((part) => (typeof part?.text === 'string' ? part.text : ''))
            .join('')
            .trim();

        if (text) {
            return text;
        }
    }

    return 'Xin loi, toi khong the tra loi luc nay.';
}

async function buildSystemPrompt(cartItems?: { name: string; quantity: number }[]) {
    const products = await Product.find({ isActive: true, stockQuantity: { $gt: 0 } })
        .sort({ viewCount: -1 })
        .limit(30)
        .select('name price unit')
        .lean();

    const recipes = await Recipe.find({ isActive: true })
        .limit(20)
        .select('name')
        .lean();

    const productList = products
        .map((product) => `- ${product.name} (${product.price.toLocaleString('vi-VN')} VND/${product.unit})`)
        .join('\n');

    const recipeList = recipes.map((recipe) => `- ${recipe.name}`).join('\n');

    const cartContext =
        cartItems && cartItems.length > 0
            ? `\nCurrent cart:\n${cartItems.map((item) => `- ${item.name} x${item.quantity}`).join('\n')}`
            : '\nCurrent cart: empty';

    return `You are the shopping assistant for TTDN Food Market in Vietnam.

Primary tasks:
1. Recommend relevant food products from the catalog.
2. Suggest simple dishes that match available ingredients.
3. Give short and practical cooking guidance.
4. Help shoppers decide what to buy next.

Rules:
- Always answer in Vietnamese.
- Keep responses concise, practical, and friendly.
- Prefer products and recipes from the provided context.
- Do not invent prices or unavailable products.
- If helpful, end with 1-2 short follow-up suggestions.
- Keep the answer under 200 words.
${cartContext}

Available products:
${productList}

Available recipes:
${recipeList}`;
}

async function createChatCompletion(messages: OpenAICompatibleMessage[]) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
    };

    const response = await fetch(`${ensureTrailingSlash(DASHSCOPE_BASE_URL)}chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: DASHSCOPE_MODEL,
            messages,
            max_tokens: 512,
            temperature: 0.7,
        }),
    });

    const rawText = await response.text();
    let payload: any = null;

    try {
        payload = rawText ? JSON.parse(rawText) : null;
    } catch {
        payload = { rawText };
    }

    if (!response.ok) {
        const error = new Error(
            payload?.error?.message || payload?.message || rawText || 'AI gateway request failed'
        );
        (error as any).status = response.status;
        throw error;
    }

    return payload;
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message, sessionId, cartItems, currentPage } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({ error: 'Missing message or sessionId' });
        }

        if (!DASHSCOPE_BASE_URL || !DASHSCOPE_MODEL || !DASHSCOPE_API_KEY) {
            return res.status(503).json({
                error: 'AI chua duoc cau hinh. Vui long kiem tra DASHSCOPE_API_KEY, DASHSCOPE_BASE_URL va DASHSCOPE_MODEL trong server/.env',
            });
        }

        const history = await ChatMessage.find({ sessionId })
            .sort({ createdAt: 1 })
            .limit(MAX_HISTORY_MESSAGES)
            .select('role content');

        await ChatMessage.create({
            sessionId,
            user: req.user?.userId,
            role: MessageRole.USER,
            content: message,
            context: { cartItems, currentPage },
        });

        const systemPrompt = await buildSystemPrompt(cartItems);

        const messages: OpenAICompatibleMessage[] = [
            { role: 'system', content: systemPrompt },
            ...history.map((item) => ({
                role: (item.role === MessageRole.ASSISTANT ? 'assistant' : 'user') as 'assistant' | 'user',
                content: item.content,
            })),
            { role: 'user' as const, content: message },
        ];

        const completion = await createChatCompletion(messages);
        const aiResponse = extractAssistantText(completion);

        const savedMessage = await ChatMessage.create({
            sessionId,
            user: req.user?.userId,
            role: MessageRole.ASSISTANT,
            content: aiResponse,
            tokens:
                completion?.usage?.total_tokens ||
                ((completion?.usage?.prompt_tokens || 0) + (completion?.usage?.completion_tokens || 0)),
        });

        res.json({
            message: {
                _id: savedMessage._id,
                role: 'assistant',
                content: aiResponse,
                createdAt: savedMessage.createdAt,
            },
        });
    } catch (error: any) {
        console.error('Chat error:', error?.message || error);

        if (error?.status === 429) {
            return res.status(429).json({
                error: 'AI dang ban, vui long thu lai sau vai giay.',
            });
        }

        if (error?.status === 401 || error?.status === 403) {
            return res.status(503).json({
                error: 'DASHSCOPE_API_KEY khong hop le hoac da het han. Vui long kiem tra lai Model Studio API Key.',
            });
        }

        res.status(500).json({
            error: 'AI hien tai dang qua tai. Vui long thu lai sau.',
            details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        });
    }
};

export const getChatHistory = async (req: Request, res: Response) => {
    try {
        const messages = await ChatMessage.find({ sessionId: req.params.sessionId })
            .sort({ createdAt: 1 })
            .limit(50)
            .select('role content createdAt');

        res.json({ messages });
    } catch {
        res.status(500).json({ error: 'Khong the tai lich su chat' });
    }
};
