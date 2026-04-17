let appPromise;

async function getApp() {
    if (!appPromise) {
        appPromise = import('../dist/app.js').then(async ({ default: app, initializeApp }) => {
            await initializeApp();
            return app;
        });
    }

    return appPromise;
}

export default async function handler(req, res) {
    const app = await getApp();
    return app(req, res);
}
