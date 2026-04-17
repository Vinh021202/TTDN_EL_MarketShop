import { Router, Request, Response } from 'express';
import { testCloudinaryConnection, uploadImage } from '../utils/cloudinary.js';
import multer from 'multer';

const router = Router();

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// ═══════════════════════════════════════════════════════════════
// TEST ROUTES (Development only)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/test/cloudinary
 * Test Cloudinary connection
 */
router.get('/cloudinary', async (_req: Request, res: Response) => {
    try {
        const isConnected = await testCloudinaryConnection();

        if (isConnected) {
            res.json({
                success: true,
                message: 'Cloudinary connection successful',
                config: {
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Cloudinary connection failed',
            });
        }
    } catch (error: any) {
        console.error('Cloudinary test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * POST /api/test/upload
 * Test image upload
 */
router.post('/upload', upload.single('image'), async (req: Request, res: Response) => {
    try {
        const file = (req as any).file;
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Convert buffer to base64 data URI
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await uploadImage(dataURI, 'test');

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: result,
        });
    } catch (error: any) {
        console.error('Upload test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;
