import { Request, Response } from 'express';
import { Voucher, VoucherType, type IVoucher } from '../models/Voucher.model.js';

const FIXED_FREESHIP_CODE = 'FREESHIP';
const FIXED_FREESHIP_QUANTITY = 999999;
const FIXED_FREESHIP_DESCRIPTION = 'Miễn phí vận chuyển cố định cho đơn hàng đủ điều kiện.';

const parseBoolean = (value: unknown, fallback: boolean) => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(normalized)) {
            return true;
        }

        if (['false', '0', 'no', 'off'].includes(normalized)) {
            return false;
        }
    }

    return fallback;
};

const normalizeVoucherCode = (value: unknown) =>
    String(value || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9_-]/g, '');

const parseInteger = (value: unknown) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
};

const serializeVoucher = (voucher: IVoucher) => {
    const raw = voucher.toObject({ virtuals: true });

    return {
        ...raw,
        remainingQuantity: Math.max(0, Number(raw.quantity || 0) - Number(raw.usedCount || 0)),
    };
};

const ensureFixedFreeshipVoucher = async () => {
    await Voucher.findOneAndUpdate(
        { code: FIXED_FREESHIP_CODE },
        {
            $set: {
                code: FIXED_FREESHIP_CODE,
                type: VoucherType.FREESHIP,
                quantity: FIXED_FREESHIP_QUANTITY,
                description: FIXED_FREESHIP_DESCRIPTION,
                isActive: true,
                isFixed: true,
            },
            $setOnInsert: {
                usedCount: 0,
            },
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );
};

const buildVoucherPayload = (body: Record<string, any>, fallbackActive = true) => {
    const code = normalizeVoucherCode(body.code);
    const quantity = parseInteger(body.quantity);
    const discountPercent = parseInteger(body.discountPercent);
    const description = String(body.description || '').trim();

    if (!code) {
        return { error: 'Mã voucher là bắt buộc.' };
    }

    if (code === FIXED_FREESHIP_CODE) {
        return { error: 'Mã FREESHIP được dành riêng cho voucher freeship cố định.' };
    }

    if (!quantity || quantity <= 0) {
        return { error: 'Số lượng voucher phải lớn hơn 0.' };
    }

    if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
        return { error: 'Phần trăm giảm giá phải nằm trong khoảng từ 1 đến 100.' };
    }

    return {
        payload: {
            code,
            type: VoucherType.PERCENTAGE,
            quantity,
            discountPercent,
            description: description || `Giảm ${discountPercent}% cho đơn hàng hợp lệ.`,
            isActive: parseBoolean(body.isActive, fallbackActive),
            isFixed: false,
        },
    };
};

export const getAllAdminVouchers = async (_req: Request, res: Response) => {
    try {
        await ensureFixedFreeshipVoucher();

        const vouchers = await Voucher.find().sort({ isFixed: -1, isActive: -1, updatedAt: -1, createdAt: -1 });
        const serialized = vouchers.map((voucher) => serializeVoucher(voucher));

        res.json({
            vouchers: serialized,
            summary: {
                total: serialized.length,
                active: serialized.filter((voucher) => voucher.isActive).length,
                remaining: serialized.reduce(
                    (total, voucher) => total + Math.max(0, Number(voucher.remainingQuantity || 0)),
                    0
                ),
                fixedCode: FIXED_FREESHIP_CODE,
            },
        });
    } catch (error) {
        console.error('Admin get vouchers error:', error);
        res.status(500).json({ error: 'Không thể tải danh sách voucher.' });
    }
};

export const createAdminVoucher = async (req: Request, res: Response) => {
    try {
        await ensureFixedFreeshipVoucher();

        const result = buildVoucherPayload(req.body || {});
        if ('error' in result) {
            return res.status(400).json({ error: result.error });
        }

        const duplicated = await Voucher.exists({ code: result.payload.code });
        if (duplicated) {
            return res.status(409).json({ error: 'Mã voucher này đã tồn tại.' });
        }

        const created = await Voucher.create(result.payload);
        res.status(201).json({ voucher: serializeVoucher(created) });
    } catch (error: any) {
        console.error('Admin create voucher error:', error);
        res.status(500).json({ error: error?.message || 'Không thể tạo voucher.' });
    }
};

export const updateAdminVoucher = async (req: Request, res: Response) => {
    try {
        await ensureFixedFreeshipVoucher();

        const voucher = await Voucher.findById(req.params.id);

        if (!voucher) {
            return res.status(404).json({ error: 'Không tìm thấy voucher.' });
        }

        if (voucher.isFixed) {
            return res.status(400).json({ error: 'Voucher freeship cố định không thể chỉnh sửa.' });
        }

        const result = buildVoucherPayload(req.body || {}, voucher.isActive);
        if ('error' in result) {
            return res.status(400).json({ error: result.error });
        }

        const duplicated = await Voucher.exists({
            code: result.payload.code,
            _id: { $ne: voucher._id },
        });

        if (duplicated) {
            return res.status(409).json({ error: 'Mã voucher này đã tồn tại.' });
        }

        voucher.set(result.payload);
        await voucher.save();

        res.json({ voucher: serializeVoucher(voucher) });
    } catch (error: any) {
        console.error('Admin update voucher error:', error);
        res.status(500).json({ error: error?.message || 'Không thể cập nhật voucher.' });
    }
};

export const deleteAdminVoucher = async (req: Request, res: Response) => {
    try {
        await ensureFixedFreeshipVoucher();

        const voucher = await Voucher.findById(req.params.id);

        if (!voucher) {
            return res.status(404).json({ error: 'Không tìm thấy voucher.' });
        }

        if (voucher.isFixed) {
            return res.status(400).json({ error: 'Voucher freeship cố định không thể xóa.' });
        }

        await voucher.deleteOne();

        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete voucher error:', error);
        res.status(500).json({ error: 'Không thể xóa voucher.' });
    }
};
