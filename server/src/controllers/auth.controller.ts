import { Request, Response } from 'express';
import { User } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════════

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validatedData = registerSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }

        // Create user
        const user = await User.create(validatedData);

        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
            return;
        }

        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// ═══════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validatedData = loginSchema.parse(req.body);

        // Find user (include password field)
        const user = await User.findOne({ email: validatedData.email }).select('+password');

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({ error: 'Account is deactivated' });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(validatedData.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors
            });
            return;
        }

        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GET CURRENT USER
// ═══════════════════════════════════════════════════════════════

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                addresses: user.addresses,
                wishlist: user.wishlist,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// ═══════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════

export const logout = async (_req: Request, res: Response): Promise<void> => {
    // Since we're using stateless JWT, logout is handled client-side
    // by removing the token from storage
    res.status(200).json({ message: 'Logged out successfully' });
};

// ═══════════════════════════════════════════════════════════════
// UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { name, phone, avatar } = req.body;

        // Validate name if provided
        if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
            res.status(400).json({ error: 'Tên phải có ít nhất 2 ký tự' });
            return;
        }

        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim();
        if (avatar !== undefined) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật thông tin thành công',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                addresses: user.addresses,
                wishlist: user.wishlist,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Cập nhật thất bại' });
    }
};

// ═══════════════════════════════════════════════════════════════
// CHANGE PASSWORD
// ═══════════════════════════════════════════════════════════════

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới' });
            return;
        }

        if (newPassword.length < 8) {
            res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
            return;
        }

        // Find user with password field
        const user = await User.findById(req.user.userId).select('+password');
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
            return;
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Đổi mật khẩu thất bại' });
    }
};
