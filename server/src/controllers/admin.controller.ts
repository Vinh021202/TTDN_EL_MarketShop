import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { User } from '../models/User.model.js';
import { v2 as cloudinary } from 'cloudinary';

// ═══════════════════════════════════════════════════════════════
// CLOUDINARY CONFIG
// ═══════════════════════════════════════════════════════════════

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ═══════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/dashboard
 * Tổng hợp thống kê cho Dashboard
 */
export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Run all queries in parallel for performance
        const [
            totalRevenue,
            todayOrders,
            monthlyRevenue,
            totalProducts,
            activeProducts,
            totalUsers,
            orderStatusCounts,
            recentOrders,
            topProducts,
        ] = await Promise.all([
            // Total revenue from COMPLETED orders
            Order.aggregate([
                { $match: { orderStatus: OrderStatus.COMPLETED } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            // Today's orders count
            Order.countDocuments({ createdAt: { $gte: todayStart } }),
            // This month's revenue
            Order.aggregate([
                { $match: { orderStatus: OrderStatus.COMPLETED, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            // Total products
            Product.countDocuments(),
            // Active products
            Product.countDocuments({ isActive: true }),
            // Total users  
            User.countDocuments({ role: 'customer' }),
            // Orders grouped by status
            Order.aggregate([
                { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
            ]),
            // Recent 10 orders
            Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('orderNumber orderStatus total createdAt user paymentMethod'),
            // Top 5 best-selling products
            Order.aggregate([
                { $match: { orderStatus: { $ne: OrderStatus.CANCELLED } } },
                { $unwind: '$items' },
                { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
            ]),
        ]);

        // Parse order status counts
        const statusMap: Record<string, number> = {};
        for (const s of orderStatusCounts) {
            statusMap[s._id] = s.count;
        }

        res.json({
            stats: {
                totalRevenue: totalRevenue[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                todayOrders,
                totalProducts,
                activeProducts,
                totalUsers,
                ordersByStatus: {
                    pending: statusMap['pending'] || 0,
                    confirmed: statusMap['confirmed'] || 0,
                    preparing: statusMap['preparing'] || 0,
                    shipping: statusMap['shipping'] || 0,
                    completed: statusMap['completed'] || 0,
                    cancelled: statusMap['cancelled'] || 0,
                },
            },
            recentOrders,
            topProducts,
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// ═══════════════════════════════════════════════════════════════
// ORDER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/orders
 * Lấy tất cả đơn hàng (admin view)
 */
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};
        if (req.query.status) filter.orderStatus = req.query.status;
        if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
        if (req.query.search) {
            filter.$or = [
                { orderNumber: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter),
        ]);

        res.json({
            orders,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

/**
 * PUT /api/admin/orders/:id/status
 * Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status, note } = req.body;
        const validStatuses = Object.values(OrderStatus);

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        // Enforce flow: PENDING→CONFIRMED→PREPARING→SHIPPING→COMPLETED
        const statusFlow = [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
            OrderStatus.SHIPPING,
            OrderStatus.COMPLETED,
        ];

        const currentIdx = statusFlow.indexOf(order.orderStatus as OrderStatus);
        const targetIdx = statusFlow.indexOf(status as OrderStatus);

        // Allow cancel only if not yet PREPARING (per ECOMMERCE-SPECS)
        if (status === OrderStatus.CANCELLED) {
            if (['preparing', 'shipping', 'completed'].includes(order.orderStatus)) {
                return res.status(400).json({
                    error: 'Không thể hủy đơn khi đã sang trạng thái Đang chuẩn bị hàng trở lên',
                });
            }
        } else {
            // Must move forward in flow
            if (targetIdx !== currentIdx + 1) {
                return res.status(400).json({
                    error: `Không thể chuyển từ "${order.orderStatus}" sang "${status}". Phải tuần tự theo flow.`,
                });
            }
        }

        // Update status and add timeline entry
        order.orderStatus = status as any;
        order.timeline.push({
            status: status as any,
            timestamp: new Date(),
            note: note || `Admin cập nhật trạng thái → ${status}`,
        });

        await order.save();
        res.json({ order });
    } catch (error: any) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

/**
 * GET /api/admin/orders/:id
 * Lấy chi tiết đơn hàng
 */
export const getOrderDetail = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images unit');

        if (!order) {
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        res.json({ order });
    } catch (error: any) {
        console.error('Get order detail error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// ═══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/users
 * Lấy danh sách tất cả users
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({
            users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

/**
 * PUT /api/admin/users/:id/toggle
 * Bật/tắt trạng thái isActive của user
 */
export const toggleUserActive = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }

        // Prevent admin from deactivating themselves
        if (req.user!.userId === req.params.id) {
            return res.status(400).json({ error: 'Không thể tự vô hiệu hóa tài khoản của mình' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: user.isActive ? 'Tài khoản đã được kích hoạt' : 'Tài khoản đã bị vô hiệu hóa',
            user: { _id: user._id, name: user.name, email: user.email, isActive: user.isActive },
        });
    } catch (error: any) {
        console.error('Toggle user active error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOAD (Cloudinary)
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/admin/upload
 * Upload ảnh lên Cloudinary từ base64
 */
export const uploadImage = async (req: Request, res: Response) => {
    try {
        const { image, folder = 'products' } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Không có ảnh được gửi lên' });
        }

        // Support base64 or URL
        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: `ttdn-market/${folder}`,
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
        });

        res.json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
        });
    } catch (error: any) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: 'Tải ảnh lên thất bại: ' + (error.message || 'Unknown error') });
    }
};
