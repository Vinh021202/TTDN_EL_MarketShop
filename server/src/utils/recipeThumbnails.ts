import cloudinary from './cloudinary.js';

export interface RecipeThumbnailAsset {
    slug: string;
    publicId: string;
    url: string;
}

const recipeSlugAliases: Record<string, string[]> = {
    'bo-xao-can-toi': ['bo-xao-can-tay'],
    'ca-hap-sa': ['ca-hap-xa'],
    'canh-bi-do-nau-thit': ['canh-bi-do'],
    'canh-mong-toi-nau-thit': ['canh-mong-toi'],
    'canh-rong-bien-thit-bam': ['canh-rong-bien'],
    'canh-trung-rong-bien': ['canh-rong-bien-trung'],
    'dau-hu-chien-sa-ot': ['dau-hu-chien-xa-ot'],
    'dau-hu-sot-ca-chua': ['dau-hu-xot-ca-chua'],
    'ga-rang-sa-ot': ['ga-chien-xa-ot'],
    'muc-xao-can-toi': ['muc-xao-can-tay'],
    'tom-hap-sa': ['tom-hap-xa'],
};

function stripVersionedSuffix(publicId: string): string {
    const match = publicId.match(/^(.*)_([a-z0-9]+)$/i);
    return match?.[1] || publicId;
}

function buildSlugCandidates(slug: string): string[] {
    const candidates = new Set<string>([
        slug,
        slug.replace('-sot-', '-xot-'),
        slug.replace('-sa-', '-xa-'),
    ]);

    for (const alias of recipeSlugAliases[slug] || []) {
        candidates.add(alias);
    }

    return Array.from(candidates).filter(Boolean);
}

export async function fetchRecipeThumbnailAssets(): Promise<RecipeThumbnailAsset[]> {
    const resources: Array<{ public_id: string; secure_url: string }> = [];
    let nextCursor: string | undefined;

    do {
        const search = cloudinary.search.expression('asset_folder:img/cong-thuc').max_results(100);
        if (nextCursor) {
            search.next_cursor(nextCursor);
        }

        const result = await search.execute();
        resources.push(...result.resources);
        nextCursor = result.next_cursor;
    } while (nextCursor);

    return resources.map((resource) => ({
        slug: stripVersionedSuffix(resource.public_id),
        publicId: resource.public_id,
        url: resource.secure_url,
    }));
}

export function findRecipeThumbnailBySlug(
    recipeSlug: string,
    assets: RecipeThumbnailAsset[]
): RecipeThumbnailAsset | undefined {
    const assetLookup = new Map(assets.map((asset) => [asset.slug, asset]));

    for (const candidate of buildSlugCandidates(recipeSlug)) {
        const matchedAsset = assetLookup.get(candidate);
        if (matchedAsset) {
            return matchedAsset;
        }
    }

    return undefined;
}
