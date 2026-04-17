import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import testRoutes from './routes/test.routes.js';
import adminRoutes from './routes/admin.routes.js';
import recipeRoutes from './routes/recipe.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

const configuredOriginPatterns = [process.env.CLIENT_URL, 'http://localhost:5173']
    .filter(Boolean)
    .flatMap((origin) => origin!.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const allowedOriginMatchers = configuredOriginPatterns.map((pattern) => {
    if (!pattern.includes('*')) {
        return { pattern, test: (origin: string) => origin === pattern };
    }

    const regex = new RegExp(`^${pattern.split('*').map(escapeRegex).join('.*')}$`);
    return { pattern, test: (origin: string) => regex.test(origin) };
});

const isAllowedOrigin = (origin: string) =>
    allowedOriginMatchers.some((matcher) => matcher.test(origin));

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOriginMatchers.length === 0 || isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('Origin not allowed by CORS'));
        },
        credentials: true,
    })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', limiter);

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart',
            orders: '/api/orders',
            test: '/api/test (development only)',
        },
    });
});

app.get('/api', (_req: Request, res: Response) => {
    res.json({
        message: 'Welcome to Ecommerce Shop API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            orders: '/api/orders',
            recipes: '/api/recipes',
        },
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/chat', chatRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.use('/api/test', testRoutes);
}

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

let initializationPromise: Promise<void> | null = null;

export const initializeApp = async (): Promise<void> => {
    if (!initializationPromise) {
        initializationPromise = connectDatabase().catch((error) => {
            initializationPromise = null;
            throw error;
        });
    }

    await initializationPromise;
};

export default app;
