import { v2 as cloudinary } from 'cloudinary';

// ═══════════════════════════════════════════════════════════════
// CLOUDINARY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ═══════════════════════════════════════════════════════════════
// UPLOAD FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Upload image to Cloudinary
 * @param file - File buffer or path
 * @param folder - Folder name in Cloudinary (default: 'products')
 */
export async function uploadImage(
    file: string | Buffer,
    folder: string = 'products'
): Promise<{ url: string; publicId: string }> {
    try {
        let fileStr = file as string;
        if (Buffer.isBuffer(file)) {
            fileStr = `data:image/jpeg;base64,${file.toString('base64')}`;
        }

        const result = await cloudinary.uploader.upload(fileStr, {
            folder,
            resource_type: 'auto',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
    files: (string | Buffer)[],
    folder: string = 'products'
): Promise<{ url: string; publicId: string }[]> {
    try {
        const uploadPromises = files.map((file) => uploadImage(file, folder));
        return await Promise.all(uploadPromises);
    } catch (error: any) {
        console.error('Cloudinary multiple upload error:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
}

/**
 * Test Cloudinary connection
 */
export async function testCloudinaryConnection(): Promise<boolean> {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful:', result);
        return true;
    } catch (error: any) {
        console.error('❌ Cloudinary connection failed:', error.message);
        return false;
    }
}

export default cloudinary;
