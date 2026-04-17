import { ImgHTMLAttributes, useEffect, useState } from 'react';

interface AutoCutoutImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    autoCutout?: boolean;
}

interface RgbaColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

interface BackgroundAnalysis {
    background: RgbaColor;
    strictThreshold: number;
    softThreshold: number;
}

const cutoutCache = new Map<string, Promise<string | null>>();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function readColor(data: Uint8ClampedArray, offset: number): RgbaColor {
    return {
        r: data[offset],
        g: data[offset + 1],
        b: data[offset + 2],
        a: data[offset + 3],
    };
}

function colorDistance(first: RgbaColor, second: RgbaColor) {
    const red = first.r - second.r;
    const green = first.g - second.g;
    const blue = first.b - second.b;
    return Math.sqrt(red * red + green * green + blue * blue);
}

function averageColors(colors: RgbaColor[]) {
    const totals = colors.reduce(
        (accumulator, color) => ({
            r: accumulator.r + color.r,
            g: accumulator.g + color.g,
            b: accumulator.b + color.b,
            a: accumulator.a + color.a,
        }),
        { r: 0, g: 0, b: 0, a: 0 }
    );

    const count = Math.max(colors.length, 1);
    return {
        r: Math.round(totals.r / count),
        g: Math.round(totals.g / count),
        b: Math.round(totals.b / count),
        a: Math.round(totals.a / count),
    };
}

function sampleArea(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
    sampleWidth: number,
    sampleHeight: number
) {
    const colors: RgbaColor[] = [];

    for (let y = startY; y < Math.min(startY + sampleHeight, height); y += 1) {
        for (let x = startX; x < Math.min(startX + sampleWidth, width); x += 1) {
            const offset = (y * width + x) * 4;
            colors.push(readColor(data, offset));
        }
    }

    return averageColors(colors);
}

function sampleCornerColors(data: Uint8ClampedArray, width: number, height: number) {
    const sampleSize = clamp(Math.round(Math.min(width, height) * 0.12), 6, 18);

    return [
        sampleArea(data, width, height, 0, 0, sampleSize, sampleSize),
        sampleArea(data, width, height, width - sampleSize, 0, sampleSize, sampleSize),
        sampleArea(data, width, height, 0, height - sampleSize, sampleSize, sampleSize),
        sampleArea(data, width, height, width - sampleSize, height - sampleSize, sampleSize, sampleSize),
    ];
}

function calculateEdgeMatchRatio(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    background: RgbaColor,
    threshold: number
) {
    let matched = 0;
    let total = 0;

    for (let x = 0; x < width; x += 1) {
        const topOffset = x * 4;
        const bottomOffset = ((height - 1) * width + x) * 4;
        matched += Number(colorDistance(readColor(data, topOffset), background) <= threshold);
        matched += Number(colorDistance(readColor(data, bottomOffset), background) <= threshold);
        total += 2;
    }

    for (let y = 1; y < height - 1; y += 1) {
        const leftOffset = (y * width) * 4;
        const rightOffset = (y * width + (width - 1)) * 4;
        matched += Number(colorDistance(readColor(data, leftOffset), background) <= threshold);
        matched += Number(colorDistance(readColor(data, rightOffset), background) <= threshold);
        total += 2;
    }

    return total > 0 ? matched / total : 0;
}

function analyzeBackground(data: Uint8ClampedArray, width: number, height: number): BackgroundAnalysis | null {
    const corners = sampleCornerColors(data, width, height);
    const background = averageColors(corners);
    const maxCornerDistance = Math.max(...corners.map((corner) => colorDistance(corner, background)));
    const averageCornerAlpha = corners.reduce((sum, corner) => sum + corner.a, 0) / Math.max(corners.length, 1);
    const edgeMatchRatio = calculateEdgeMatchRatio(data, width, height, background, 42);

    if (averageCornerAlpha < 220) {
        return null;
    }

    if (maxCornerDistance > 36 || edgeMatchRatio < 0.62) {
        return null;
    }

    const strictThreshold = clamp(24 + maxCornerDistance * 0.8, 24, 36);
    return {
        background,
        strictThreshold,
        softThreshold: strictThreshold + 18,
    };
}

function updateBounds(bounds: Bounds, x: number, y: number) {
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
}

function removeUniformBackground(imageData: ImageData) {
    const { data, width, height } = imageData;
    const analysis = analyzeBackground(data, width, height);

    if (!analysis) {
        return null;
    }

    const { background, strictThreshold, softThreshold } = analysis;
    const totalPixels = width * height;
    const visited = new Uint8Array(totalPixels);
    const queue = new Uint32Array(totalPixels);
    let queueStart = 0;
    let queueEnd = 0;

    const tryQueuePixel = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= width || y >= height) {
            return;
        }

        const pixelIndex = y * width + x;
        if (visited[pixelIndex]) {
            return;
        }

        const offset = pixelIndex * 4;
        const alpha = data[offset + 3];
        if (alpha === 0) {
            visited[pixelIndex] = 1;
            return;
        }

        const distance = colorDistance(readColor(data, offset), background);
        if (distance <= softThreshold) {
            visited[pixelIndex] = 1;
            queue[queueEnd] = pixelIndex;
            queueEnd += 1;
        }
    };

    for (let x = 0; x < width; x += 1) {
        tryQueuePixel(x, 0);
        tryQueuePixel(x, height - 1);
    }

    for (let y = 1; y < height - 1; y += 1) {
        tryQueuePixel(0, y);
        tryQueuePixel(width - 1, y);
    }

    while (queueStart < queueEnd) {
        const pixelIndex = queue[queueStart];
        queueStart += 1;

        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        tryQueuePixel(x + 1, y);
        tryQueuePixel(x - 1, y);
        tryQueuePixel(x, y + 1);
        tryQueuePixel(x, y - 1);
    }

    const bounds: Bounds = {
        minX: width,
        minY: height,
        maxX: -1,
        maxY: -1,
    };

    let removedPixels = 0;
    let retainedPixels = 0;

    for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
        const offset = pixelIndex * 4;
        const originalAlpha = data[offset + 3];
        if (originalAlpha === 0) {
            continue;
        }

        if (visited[pixelIndex]) {
            const distance = colorDistance(readColor(data, offset), background);
            const nextAlpha =
                distance <= strictThreshold
                    ? 0
                    : Math.round(originalAlpha * clamp((distance - strictThreshold) / (softThreshold - strictThreshold), 0, 1));

            data[offset + 3] = nextAlpha < 18 ? 0 : nextAlpha;
        }

        if (data[offset + 3] > 18) {
            retainedPixels += 1;
            updateBounds(bounds, pixelIndex % width, Math.floor(pixelIndex / width));
        } else {
            removedPixels += 1;
        }
    }

    if (removedPixels / totalPixels < 0.08 || retainedPixels / totalPixels < 0.12 || bounds.maxX < bounds.minX) {
        return null;
    }

    return { imageData, bounds };
}

async function loadImage(src: string) {
    if (typeof window === 'undefined') {
        return null;
    }

    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.crossOrigin = 'anonymous';
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
        image.src = src;
    });
}

async function createCutoutDataUrl(src: string) {
    if (typeof document === 'undefined') {
        return null;
    }

    const image = await loadImage(src);
    if (!image) {
        return null;
    }

    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longestSide > 360 ? 360 / longestSide : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;

    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) {
        return null;
    }

    sourceContext.drawImage(image, 0, 0, width, height);

    let imageData: ImageData;
    try {
        imageData = sourceContext.getImageData(0, 0, width, height);
    } catch {
        return null;
    }

    const result = removeUniformBackground(imageData);
    if (!result) {
        return null;
    }

    sourceContext.putImageData(result.imageData, 0, 0);

    const croppedWidth = result.bounds.maxX - result.bounds.minX + 1;
    const croppedHeight = result.bounds.maxY - result.bounds.minY + 1;
    if (croppedWidth <= 0 || croppedHeight <= 0) {
        return null;
    }

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;

    const outputContext = outputCanvas.getContext('2d');
    if (!outputContext) {
        return null;
    }

    const paddingRatio = 0.12;
    const targetWidth = width * (1 - paddingRatio * 2);
    const targetHeight = height * (1 - paddingRatio * 2);
    const scaleToFit = Math.min(targetWidth / croppedWidth, targetHeight / croppedHeight);
    const drawWidth = croppedWidth * scaleToFit;
    const drawHeight = croppedHeight * scaleToFit;
    const drawX = (width - drawWidth) / 2;
    const drawY = (height - drawHeight) / 2;

    outputContext.clearRect(0, 0, width, height);
    outputContext.imageSmoothingEnabled = true;
    outputContext.drawImage(
        sourceCanvas,
        result.bounds.minX,
        result.bounds.minY,
        croppedWidth,
        croppedHeight,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );

    return outputCanvas.toDataURL('image/png');
}

async function processAutoCutout(src: string) {
    if (!cutoutCache.has(src)) {
        cutoutCache.set(
            src,
            createCutoutDataUrl(src).catch(() => {
                cutoutCache.delete(src);
                return null;
            })
        );
    }

    return cutoutCache.get(src) ?? null;
}

export function AutoCutoutImage({ src, autoCutout = true, ...props }: AutoCutoutImageProps) {
    const [displaySrc, setDisplaySrc] = useState(src);

    useEffect(() => {
        let isMounted = true;
        setDisplaySrc(src);

        if (!autoCutout || !src) {
            return () => {
                isMounted = false;
            };
        }

        processAutoCutout(src).then((processedSrc) => {
            if (!isMounted || !processedSrc) {
                return;
            }

            setDisplaySrc(processedSrc);
        });

        return () => {
            isMounted = false;
        };
    }, [autoCutout, src]);

    return <img {...props} src={displaySrc} alt={props.alt} />;
}
