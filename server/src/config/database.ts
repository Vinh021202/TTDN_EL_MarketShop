import mongoose from 'mongoose';

let connectionPromise: Promise<void> | null = null;
let hasLoggedMissingUri = false;
let hasRegisteredListeners = false;

const registerConnectionListeners = () => {
    if (hasRegisteredListeners) {
        return;
    }

    hasRegisteredListeners = true;

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
    });
};

export const connectDatabase = async (): Promise<void> => {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        if (!hasLoggedMissingUri) {
            console.warn('MONGODB_URI not set. Running in offline mode.');
            console.warn('Set MONGODB_URI in server/.env or Vercel env settings to enable database.');
            hasLoggedMissingUri = true;
        }

        return;
    }

    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (mongoose.connection.readyState === 2 && connectionPromise) {
        await connectionPromise;
        return;
    }

    try {
        if (!connectionPromise) {
            registerConnectionListeners();

            connectionPromise = mongoose
                .connect(MONGODB_URI, {
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                })
                .then(() => {
                    console.log('Connected to MongoDB Atlas');
                })
                .catch((error) => {
                    connectionPromise = null;
                    throw error;
                });
        }

        await connectionPromise;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        console.warn('Server will run in offline mode.');
    }
};

export default mongoose;
