import app, { initializeApp } from '../server/src/app.js';

type AppRequest = Parameters<typeof app>[0];
type AppResponse = Parameters<typeof app>[1];

export default async function handler(req: AppRequest, res: AppResponse) {
    await initializeApp();
    return app(req, res);
}
