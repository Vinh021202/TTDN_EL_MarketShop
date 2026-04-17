import app, { initializeApp } from './app.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await initializeApp();

        app.listen(PORT, () => {
            console.log('Ecommerce Shop API server started');
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Port: ${PORT}`);
            console.log(`Health: http://localhost:${PORT}/api/health`);
            console.log(`API: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
