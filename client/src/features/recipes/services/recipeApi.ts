import axios from 'axios';
import { API_BASE_URL } from '@/features/shared/api/apiBaseUrl';

export interface Recipe {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    prepTime: number;
    cookTime: number;
    totalTime?: number;
    servings: number;
    difficulty: string;
    tags: string[];
    estimatedCost?: number;
    calories?: number;
    isFeatured: boolean;
    viewCount: number;
    ingredients?: any[];
    steps?: any[];
}

export interface RecipeFilters {
    page?: number;
    limit?: number;
    mood?: string;
    q?: string;
    maxTime?: number;
    difficulty?: string;
}

export const getRecipes = async (filters: RecipeFilters = {}) => {
    const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
    );

    const { data } = await axios.get(`${API_BASE_URL}/recipes`, { params });
    return data;
};

export const getFeaturedRecipes = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/recipes/featured`);
    return data;
};

export const getRecipeBySlug = async (slug: string) => {
    const { data } = await axios.get(`${API_BASE_URL}/recipes/${slug}`);
    return data;
};
