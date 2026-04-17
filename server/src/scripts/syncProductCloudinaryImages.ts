import 'dotenv/config';
import mongoose from 'mongoose';
import { Product, IProductImage } from '../models/Product.model.js';
import { productCloudinaryImageMap } from '../data/productCloudinaryMap.js';

const legacyCloudinaryPattern = /\/image\/upload\/(?:[^/]+\/)*v1\/ttdn\//i;

function normalizeExistingImages(images: unknown[], productName: string): IProductImage[] {
    return (images || [])
        .map((image, index) => {
            if (!image) {
                return null;
            }

            if (typeof image === 'string') {
                return {
                    url: image,
                    alt: productName,
                    isPrimary: index === 0,
                } as IProductImage;
            }

            const candidate = image as Partial<IProductImage>;
            if (!candidate.url) {
                return null;
            }

            return {
                url: candidate.url,
                publicId: candidate.publicId,
                alt: candidate.alt || productName,
                isPrimary: index === 0,
            } as IProductImage;
        })
        .filter((image): image is IProductImage => Boolean(image?.url));
}

function buildNextImages(sku: string, productName: string, images: unknown[]): IProductImage[] | null {
    const mappedImage = productCloudinaryImageMap[sku];
    if (!mappedImage) {
        return null;
    }

    const preservedImages = normalizeExistingImages(images, productName)
        .filter((image) => image.url !== mappedImage.url)
        .filter((image) => !legacyCloudinaryPattern.test(image.url))
        .map((image) => ({
            ...image,
            isPrimary: false,
        }));

    return [
        {
            url: mappedImage.url,
            publicId: mappedImage.publicId,
            alt: productName,
            isPrimary: true,
        },
        ...preservedImages,
    ];
}

function imagesDiffer(currentImages: IProductImage[], nextImages: IProductImage[]): boolean {
    if (currentImages.length !== nextImages.length) {
        return true;
    }

    return currentImages.some((image, index) => {
        const nextImage = nextImages[index];
        return (
            image.url !== nextImage.url ||
            image.publicId !== nextImage.publicId ||
            image.isPrimary !== nextImage.isPrimary ||
            image.alt !== nextImage.alt
        );
    });
}

async function syncProductCloudinaryImages() {
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri || mongoUri.includes('<user>')) {
        throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(mongoUri);

    const products = await Product.find({
        sku: { $in: Object.keys(productCloudinaryImageMap) },
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
        const nextImages = buildNextImages(product.sku, product.name, product.images as unknown[]);
        if (!nextImages) {
            skippedCount += 1;
            continue;
        }

        const currentImages = normalizeExistingImages(product.images as unknown[], product.name);
        if (!imagesDiffer(currentImages, nextImages)) {
            skippedCount += 1;
            continue;
        }

        product.images = nextImages;
        await product.save();
        updatedCount += 1;
        console.log(`Updated ${product.sku} -> ${nextImages[0].publicId}`);
    }

    const legacyImageProducts = await Product.countDocuments({
        'images.url': { $regex: legacyCloudinaryPattern },
    });

    console.log('\nSync complete');
    console.log(`Updated products: ${updatedCount}`);
    console.log(`Skipped products: ${skippedCount}`);
    console.log(`Remaining legacy image URLs: ${legacyImageProducts}`);
}

syncProductCloudinaryImages()
    .then(async () => {
        await mongoose.disconnect();
        process.exit(0);
    })
    .catch(async (error: any) => {
        console.error('Failed to sync product images:', error.message);
        console.error(error);
        await mongoose.disconnect().catch(() => undefined);
        process.exit(1);
    });
