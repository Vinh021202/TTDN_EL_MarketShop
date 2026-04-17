import { Router } from 'express';
import {
    getRecipes,
    getFeaturedRecipes,
    getRecipeBySlug,
    getRecipeById,
} from '../controllers/recipe.controller.js';

const router = Router();

// GET /api/recipes – Danh sách với filter
router.get('/', getRecipes);

// GET /api/recipes/featured – Công thức nổi bật
router.get('/featured', getFeaturedRecipes);

// GET /api/recipes/id/:id – Lấy theo ID (admin)
router.get('/id/:id', getRecipeById);

// GET /api/recipes/:slug – Chi tiết theo slug
router.get('/:slug', getRecipeBySlug);

export default router;
