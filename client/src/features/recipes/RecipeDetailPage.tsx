import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    ChefHat,
    Clock3,
    Loader2,
    ShoppingCart,
    Sparkles,
    Users,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/components/ui';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { formatDisplayCurrency, translate } from '@/features/shared/utils/displayPreferences';
import { reserveStock } from '@/features/cart/services/cartApi';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';
import { getRecipeBySlug, type Recipe } from './services/recipeApi';

interface RecipeProductImage {
    url?: string;
    alt?: string;
}

interface RecipeMatchedProduct {
    _id: string;
    name: string;
    price: number;
    unit?: string;
    stockQuantity?: number;
    images?: Array<string | RecipeProductImage>;
}

interface RecipeIngredient {
    quantity?: number;
    unit?: string;
    notes?: string;
    isOptional?: boolean;
    matchedProduct?: RecipeMatchedProduct | null;
}

interface RecipeStep {
    order?: number;
    instruction: string;
    duration?: number;
    tips?: string;
}

type RecipeDetail = Recipe & {
    calories?: number;
    estimatedCost?: number;
    ingredients?: RecipeIngredient[];
    steps?: RecipeStep[];
};

const fallbackGradients = [
    'linear-gradient(135deg, rgba(13, 164, 135, 0.95), rgba(24, 111, 80, 0.88))',
    'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(234, 88, 12, 0.88))',
    'linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(37, 99, 235, 0.88))',
    'linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(236, 72, 153, 0.88))',
];

const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') {
        return '--';
    }

    return formatDisplayCurrency(value);
};

const normalizeText = (value?: string) =>
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const getDifficultyBadgeClassName = (difficulty?: string) => {
    const normalized = normalizeText(difficulty);

    if (normalized === 'de') {
        return 'bg-success-subtle text-success-emphasis';
    }

    if (normalized === 'trung binh') {
        return 'bg-warning-subtle text-warning-emphasis';
    }

    if (normalized === 'kho') {
        return 'bg-danger-subtle text-danger-emphasis';
    }

    return 'bg-light text-muted';
};

const getProductImage = (product?: RecipeMatchedProduct | null) => {
    const image = product?.images?.[0];

    if (!image) {
        return '';
    }

    return typeof image === 'string' ? image : image.url || '';
};

const getTotalTime = (recipe: RecipeDetail) => recipe.totalTime || recipe.prepTime + recipe.cookTime;

export function RecipeDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const language = useThemeStore((state) => state.language);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addItem = useCartStore((state) => state.addItem);
    const setReservationExpiry = useCartStore((state) => state.setReservationExpiry);

    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingAll, setAddingAll] = useState(false);
    const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());

    const getIngredientTitle = (ingredient: RecipeIngredient, index: number) =>
        ingredient.matchedProduct?.name ||
        ingredient.notes ||
        translate(
            {
                vi: `Nguyên liệu ${index + 1}`,
                en: `Ingredient ${index + 1}`,
            },
            language
        );

    const getIngredientAmount = (ingredient: RecipeIngredient) => {
        const quantity =
            typeof ingredient.quantity === 'number' && Number.isFinite(ingredient.quantity)
                ? ingredient.quantity
                : null;
        const unit = ingredient.unit?.trim();

        if (quantity !== null && unit) {
            return `${quantity} ${unit}`;
        }

        if (quantity !== null) {
            return `${quantity}`;
        }

        if (unit) {
            return unit;
        }

        return translate({ vi: 'Đang cập nhật', en: 'Updating' }, language);
    };

    useEffect(() => {
        let active = true;

        if (!slug) {
            setError(translate({ vi: 'Không tìm thấy công thức.', en: 'Recipe not found.' }, language));
            setLoading(false);
            return () => {
                active = false;
            };
        }

        const fetchRecipe = async () => {
            setLoading(true);
            setError('');

            try {
                const data = await getRecipeBySlug(slug);

                if (!active) {
                    return;
                }

                setRecipe((data.recipe || null) as RecipeDetail | null);
                setAddedProductIds(new Set());
            } catch {
                if (active) {
                    setRecipe(null);
                    setError(translate({ vi: 'Không thể tải công thức này.', en: 'Unable to load this recipe.' }, language));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchRecipe();

        return () => {
            active = false;
        };
    }, [slug, language]);

    const availableIngredients = useMemo(() => {
        return (recipe?.ingredients || []).filter((ingredient) => ingredient.matchedProduct?._id);
    }, [recipe]);

    const matchedProducts = useMemo(() => {
        const uniqueProducts = new Map<string, RecipeMatchedProduct>();

        for (const ingredient of recipe?.ingredients || []) {
            const product = ingredient.matchedProduct;

            if (!product?._id || (product.stockQuantity || 0) <= 0 || uniqueProducts.has(product._id)) {
                continue;
            }

            uniqueProducts.set(product._id, product);
        }

        return Array.from(uniqueProducts.values());
    }, [recipe]);

    const requireAuth = () => {
        if (isAuthenticated) {
            return true;
        }

        toast.error(
            translate(
                {
                    vi: 'Vui lòng đăng nhập để thêm nguyên liệu vào giỏ hàng.',
                    en: 'Please sign in before adding ingredients to your cart.',
                },
                language
            )
        );
        navigate('/login', {
            state: {
                from: location.pathname,
            },
        });

        return false;
    };

    const addMatchedProductToCart = async (product: RecipeMatchedProduct) => {
        const response = await reserveStock({
            productId: product._id,
            quantity: 1,
        });

        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            unit: product.unit || translate({ vi: 'sản phẩm', en: 'item' }, language),
            image: getProductImage(product),
        });

        setReservationExpiry(new Date(response.expiresAt));
        setAddedProductIds((previous) => {
            const next = new Set(previous);
            next.add(product._id);
            return next;
        });
    };

    const handleAddSingleProduct = async (product?: RecipeMatchedProduct | null) => {
        if (!product?._id || (product.stockQuantity || 0) <= 0) {
            return;
        }

        if (!requireAuth()) {
            return;
        }

        try {
            await addMatchedProductToCart(product);
            toast.success(
                translate(
                    {
                        vi: `Đã thêm ${product.name} vào giỏ hàng.`,
                        en: `${product.name} was added to your cart.`,
                    },
                    language
                )
            );
        } catch (cartError: any) {
            const message =
                cartError.response?.data?.error ||
                translate(
                    {
                        vi: 'Không thể thêm vào giỏ hàng.',
                        en: 'Unable to add this item to your cart.',
                    },
                    language
                );
            toast.error(message);
        }
    };

    const handleAddAllIngredients = async () => {
        if (!recipe) {
            return;
        }

        if (!matchedProducts.length) {
            toast.error(
                translate(
                    {
                        vi: 'Chưa có nguyên liệu nào khớp với sản phẩm đang bán.',
                        en: 'No ingredients are matched to products currently being sold.',
                    },
                    language
                )
            );
            return;
        }

        if (!requireAuth()) {
            return;
        }

        setAddingAll(true);

        let addedCount = 0;
        let failedCount = 0;

        for (const product of matchedProducts) {
            try {
                await addMatchedProductToCart(product);
                addedCount += 1;
            } catch {
                failedCount += 1;
            }
        }

        if (addedCount > 0 && failedCount > 0) {
            toast.success(
                translate(
                    {
                        vi: `Đã thêm ${addedCount} nguyên liệu. ${failedCount} mục cần kiểm tra lại tồn kho.`,
                        en: `Added ${addedCount} ingredients. ${failedCount} items need another stock check.`,
                    },
                    language
                )
            );
        } else if (addedCount > 0) {
            toast.success(
                translate(
                    {
                        vi: `Đã thêm ${addedCount} nguyên liệu vào giỏ hàng.`,
                        en: `Added ${addedCount} ingredients to your cart.`,
                    },
                    language
                )
            );
        } else {
            toast.error(
                translate(
                    {
                        vi: 'Không thể thêm nguyên liệu nào vào giỏ hàng.',
                        en: 'Unable to add any ingredients to your cart.',
                    },
                    language
                )
            );
        }

        setAddingAll(false);
    };

    if (loading) {
        return (
            <>
                <StorefrontBreadcrumb
                    title={translate({ vi: 'Đang tải công thức', en: 'Loading recipe' }, language)}
                    items={[
                        { label: translate({ vi: 'Kho công thức', en: 'Recipe library' }, language), to: '/recipes' },
                        { label: translate({ vi: 'Đang tải', en: 'Loading' }, language) },
                    ]}
                    subtitle={translate(
                        {
                            vi: 'Thông tin công thức và nguyên liệu sẽ được hiển thị trong giây lát.',
                            en: 'Recipe and ingredient details will appear shortly.',
                        },
                        language
                    )}
                />

                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <Loader2 size={38} className="text-success mx-auto mb-3" />
                            <h2 className="h4 fw-bold text-dark mb-2">
                                {translate({ vi: 'Đang tải chi tiết công thức', en: 'Loading recipe details' }, language)}
                            </h2>
                            <p className="text-muted mb-0">
                                {translate(
                                    {
                                        vi: 'Chuẩn bị nội dung món ăn, nguyên liệu và các bước thực hiện cho bạn.',
                                        en: 'Preparing the recipe, ingredients, and cooking steps for you.',
                                    },
                                    language
                                )}
                            </p>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    if (!recipe || error) {
        return (
            <>
                <StorefrontBreadcrumb
                    title={translate({ vi: 'Không tìm thấy công thức', en: 'Recipe not found' }, language)}
                    items={[
                        { label: translate({ vi: 'Kho công thức', en: 'Recipe library' }, language), to: '/recipes' },
                        { label: translate({ vi: 'Không khả dụng', en: 'Unavailable' }, language) },
                    ]}
                    subtitle={translate(
                        {
                            vi: 'Công thức này có thể đã bị ẩn hoặc đường dẫn hiện tại không còn hợp lệ.',
                            en: 'This recipe may be hidden or the current link is no longer valid.',
                        },
                        language
                    )}
                />

                <section className="section-b-space">
                    <div className="container-fluid-lg">
                        <div className="ttdn-empty-state text-center">
                            <AlertCircle size={42} className="text-warning mx-auto mb-3" />
                            <h2 className="h4 fw-bold text-dark mb-2">
                                {translate({ vi: 'Không thể mở công thức', en: 'Unable to open this recipe' }, language)}
                            </h2>
                            <p className="text-muted mb-4">
                                {error ||
                                    translate(
                                        {
                                            vi: 'Công thức không khả dụng lúc này.',
                                            en: 'This recipe is not available right now.',
                                        },
                                        language
                                    )}
                            </p>
                            <Link to="/recipes" className="btn theme-bg-color text-white rounded-pill px-4">
                                {translate({ vi: 'Quay lại kho công thức', en: 'Back to recipe library' }, language)}
                            </Link>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    const totalTime = getTotalTime(recipe);
    const heroGradient = fallbackGradients[recipe.name.length % fallbackGradients.length];

    return (
        <>
            <StorefrontBreadcrumb
                title={recipe.name}
                items={[
                    { label: translate({ vi: 'Kho công thức', en: 'Recipe library' }, language), to: '/recipes' },
                    { label: recipe.name },
                ]}
                subtitle={translate(
                    {
                        vi: 'Xem cách nấu, chọn nguyên liệu phù hợp và thêm nhanh vào giỏ hàng.',
                        en: 'See how to cook it, choose matching ingredients, and add them to your cart quickly.',
                    },
                    language
                )}
            />

            <section className="section-b-space">
                <div className="container-fluid-lg">
                    <div className="ttdn-page-hero mb-5">
                        <div className="row g-4 align-items-center">
                            <div className="col-lg-7">
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                    {recipe.isFeatured ? (
                                        <span className="ttdn-meta-chip">
                                            <Sparkles size={14} />
                                            {translate({ vi: 'Nổi bật', en: 'Featured' }, language)}
                                        </span>
                                    ) : null}
                                    <span className="ttdn-meta-chip">
                                        <ChefHat size={14} />
                                        {translate(
                                            {
                                                vi: `${availableIngredients.length} nguyên liệu có đối chiếu`,
                                                en: `${availableIngredients.length} matched ingredients`,
                                            },
                                            language
                                        )}
                                    </span>
                                </div>

                                <h1 className="display-6 fw-bold text-white mb-3">{recipe.name}</h1>
                                <p className="text-white-50 mb-4">
                                    {recipe.description ||
                                        translate(
                                            {
                                                vi: 'Mở công thức để xem nguyên liệu, sản phẩm khớp với nguyên liệu và các bước nấu ăn.',
                                                en: 'Open the recipe to see ingredients, matched products, and cooking steps.',
                                            },
                                            language
                                        )}
                                </p>

                                <div className="d-flex flex-wrap gap-2">
                                    <span className="ttdn-meta-chip">
                                        <Clock3 size={14} />
                                        {translate({ vi: `Tổng ${totalTime} phút`, en: `Total ${totalTime} min` }, language)}
                                    </span>
                                    <span className="ttdn-meta-chip">
                                        <Users size={14} />
                                        {translate(
                                            {
                                                vi: `${recipe.servings} khẩu phần`,
                                                en: `${recipe.servings} servings`,
                                            },
                                            language
                                        )}
                                    </span>
                                    <span
                                        className={`badge rounded-pill px-3 py-2 ${getDifficultyBadgeClassName(
                                            recipe.difficulty
                                        )}`}
                                    >
                                        {recipe.difficulty}
                                    </span>
                                    {typeof recipe.calories === 'number' ? (
                                        <span className="ttdn-meta-chip">{recipe.calories} kcal</span>
                                    ) : null}
                                </div>
                            </div>

                            <div className="col-lg-5">
                                <div className="ttdn-image-panel">
                                    {recipe.thumbnail ? (
                                        <img
                                            src={recipe.thumbnail}
                                            alt={recipe.name}
                                            className="img-fluid rounded-4 w-100"
                                            style={{ maxHeight: 320, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="ttdn-blog-fallback rounded-4"
                                            style={{ background: heroGradient, minHeight: 320 }}
                                        >
                                            <ChefHat size={58} />
                                        </div>
                                    )}

                                    <div className="d-flex flex-wrap gap-3 mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-light rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                            onClick={() => navigate('/recipes')}
                                        >
                                            <ArrowLeft size={16} />
                                            {translate({ vi: 'Về danh sách', en: 'Back to list' }, language)}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn theme-bg-color text-white rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                            onClick={handleAddAllIngredients}
                                            disabled={addingAll || matchedProducts.length === 0}
                                        >
                                            {addingAll ? <Loader2 size={16} /> : <ShoppingCart size={16} />}
                                            {translate({ vi: 'Thêm tất cả nguyên liệu', en: 'Add all ingredients' }, language)}
                                        </button>
                                    </div>

                                    <div className="ttdn-panel mt-4">
                                        <div className="row g-3">
                                            <div className="col-sm-6">
                                                <p className="text-uppercase small fw-bold text-muted mb-1">
                                                    {translate({ vi: 'Chi phí ước tính', en: 'Estimated cost' }, language)}
                                                </p>
                                                <h3 className="h5 fw-bold text-dark mb-0">
                                                    {formatCurrency(recipe.estimatedCost)}
                                                </h3>
                                            </div>
                                            <div className="col-sm-6">
                                                <p className="text-uppercase small fw-bold text-muted mb-1">
                                                    {translate({ vi: 'Sản phẩm có sẵn', en: 'Available products' }, language)}
                                                </p>
                                                <h3 className="h5 fw-bold text-dark mb-0">{matchedProducts.length}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4 align-items-start">
                        <div className="col-lg-5 col-xl-4">
                            <div className="ttdn-panel ttdn-account-sidebar">
                                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                                    <div>
                                        <p className="text-uppercase small fw-bold theme-color mb-1">
                                            {translate({ vi: 'Nguyên liệu', en: 'Ingredients' }, language)}
                                        </p>
                                        <h2 className="h4 fw-bold text-dark mb-0">
                                            {translate(
                                                {
                                                    vi: `${recipe.ingredients?.length || 0} mục cần chuẩn bị`,
                                                    en: `${recipe.ingredients?.length || 0} items to prepare`,
                                                },
                                                language
                                            )}
                                        </h2>
                                    </div>
                                    <div className="ttdn-account-stat">
                                        <p className="small text-muted mb-1">
                                            {translate({ vi: 'Đối chiếu', en: 'Matched' }, language)}
                                        </p>
                                        <h3 className="h5 fw-bold text-dark mb-0">{matchedProducts.length}</h3>
                                    </div>
                                </div>

                                <p className="ttdn-inline-note mb-4">
                                    {translate(
                                        {
                                            vi: 'Mỗi nút thêm sẽ đặt giữ 1 đơn vị bán hàng của sản phẩm khớp với nguyên liệu.',
                                            en: 'Each add button reserves one sellable unit of the matched product.',
                                        },
                                        language
                                    )}
                                </p>

                                <div className="d-flex flex-column gap-3">
                                    {(recipe.ingredients || []).map((ingredient, index) => {
                                        const product = ingredient.matchedProduct;
                                        const productImage = getProductImage(product);
                                        const isAvailable = Boolean(product?._id) && (product.stockQuantity || 0) > 0;
                                        const isAdded = Boolean(product?._id) && addedProductIds.has(product._id);

                                        return (
                                            <article
                                                key={`${getIngredientTitle(ingredient, index)}-${index}`}
                                                className="ttdn-recipe-ingredient-card d-flex gap-3"
                                            >
                                                <div className="ttdn-recipe-thumbnail">
                                                    {productImage ? (
                                                        <img src={productImage} alt={getIngredientTitle(ingredient, index)} />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-success">
                                                            <ChefHat size={28} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-grow-1">
                                                    <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                                                        <h3 className="h6 fw-bold text-dark mb-0">
                                                            {getIngredientTitle(ingredient, index)}
                                                        </h3>
                                                        {ingredient.isOptional ? (
                                                            <span className="badge bg-light text-muted rounded-pill">
                                                                {translate({ vi: 'Tùy chọn', en: 'Optional' }, language)}
                                                            </span>
                                                        ) : null}
                                                        {isAvailable ? (
                                                            <span className="badge bg-success-subtle text-success-emphasis rounded-pill">
                                                                {translate({ vi: 'Có sẵn', en: 'In stock' }, language)}
                                                            </span>
                                                        ) : product?._id ? (
                                                            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill">
                                                                {translate({ vi: 'Hết hàng', en: 'Out of stock' }, language)}
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-light text-muted rounded-pill">
                                                                {translate({ vi: 'Chưa đối chiếu', en: 'Not matched' }, language)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-content mb-2">{getIngredientAmount(ingredient)}</p>

                                                    {ingredient.notes && ingredient.notes !== product?.name ? (
                                                        <p className="small text-muted mb-2">{ingredient.notes}</p>
                                                    ) : null}

                                                    {product ? (
                                                        <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                                                            <span>{formatCurrency(product.price)}</span>
                                                            <span>{product.unit || translate({ vi: 'sản phẩm', en: 'item' }, language)}</span>
                                                            <span>
                                                                {translate(
                                                                    {
                                                                        vi: `${product.stockQuantity || 0} còn lại`,
                                                                        en: `${product.stockQuantity || 0} left`,
                                                                    },
                                                                    language
                                                                )}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p className="small text-muted mb-3">
                                                            {translate(
                                                                {
                                                                    vi: 'Chưa tìm thấy sản phẩm tương ứng trong danh mục đang bán.',
                                                                    en: 'No matching product is currently available in the store.',
                                                                },
                                                                language
                                                            )}
                                                        </p>
                                                    )}

                                                    <div className="d-flex flex-wrap gap-2">
                                                        {product ? (
                                                            <button
                                                                type="button"
                                                                className={`btn rounded-pill px-3 ${
                                                                    isAdded
                                                                        ? 'btn-success'
                                                                        : 'theme-bg-color text-white'
                                                                }`}
                                                                onClick={() => handleAddSingleProduct(product)}
                                                                disabled={!isAvailable || isAdded}
                                                            >
                                                                {isAdded ? (
                                                                    <>
                                                                        <CheckCircle2 size={16} className="me-2" />
                                                                        {translate({ vi: 'Đã thêm', en: 'Added' }, language)}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShoppingCart size={16} className="me-2" />
                                                                        {translate({ vi: 'Thêm vào giỏ', en: 'Add to cart' }, language)}
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : null}

                                                        {product?._id ? (
                                                            <Link
                                                                to={`/products/${product._id}`}
                                                                className="btn btn-light rounded-pill px-3"
                                                            >
                                                                {translate({ vi: 'Xem sản phẩm', en: 'View product' }, language)}
                                                            </Link>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7 col-xl-8">
                            <div className="ttdn-panel mb-4">
                                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                                    <div>
                                        <p className="text-uppercase small fw-bold theme-color mb-1">
                                            {translate({ vi: 'Hướng dẫn', en: 'Instructions' }, language)}
                                        </p>
                                        <h2 className="h3 fw-bold text-dark mb-0">
                                            {translate({ vi: 'Các bước thực hiện', en: 'Cooking steps' }, language)}
                                        </h2>
                                    </div>
                                    <div className="ttdn-account-stat">
                                        <p className="small text-muted mb-1">
                                            {translate({ vi: 'Tổng bước', en: 'Total steps' }, language)}
                                        </p>
                                        <h3 className="h5 fw-bold text-dark mb-0">{recipe.steps?.length || 0}</h3>
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-3">
                                    {(recipe.steps || []).map((step, index) => (
                                        <article
                                            key={`${step.order || index + 1}-${index}`}
                                            className="ttdn-step-card d-flex gap-3"
                                        >
                                            <div className="ttdn-step-index">{step.order || index + 1}</div>
                                            <div className="flex-grow-1">
                                                <p className="fw-semibold text-dark mb-2">{step.instruction}</p>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {step.duration ? (
                                                        <span className="badge bg-light text-muted rounded-pill px-3 py-2">
                                                            <Clock3 size={14} className="me-2" />
                                                            {translate(
                                                                {
                                                                    vi: `${step.duration} phút`,
                                                                    en: `${step.duration} min`,
                                                                },
                                                                language
                                                            )}
                                                        </span>
                                                    ) : null}
                                                    {step.tips ? (
                                                        <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-2">
                                                            {translate({ vi: 'Mẹo', en: 'Tip' }, language)}: {step.tips}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="ttdn-panel h-100">
                                        <p className="text-uppercase small fw-bold theme-color mb-1">
                                            {translate({ vi: 'Tổng quan', en: 'Overview' }, language)}
                                        </p>
                                        <h3 className="h4 fw-bold text-dark mb-3">
                                            {translate({ vi: 'Thông tin món ăn', en: 'Recipe details' }, language)}
                                        </h3>
                                        <div className="d-flex flex-column gap-3">
                                            <div className="ttdn-order-item-card">
                                                <p className="small text-muted text-uppercase fw-semibold mb-1">
                                                    {translate({ vi: 'Sơ chế', en: 'Prep time' }, language)}
                                                </p>
                                                <h4 className="h5 fw-bold text-dark mb-0">
                                                    {translate(
                                                        {
                                                            vi: `${recipe.prepTime} phút`,
                                                            en: `${recipe.prepTime} min`,
                                                        },
                                                        language
                                                    )}
                                                </h4>
                                            </div>
                                            <div className="ttdn-order-item-card">
                                                <p className="small text-muted text-uppercase fw-semibold mb-1">
                                                    {translate({ vi: 'Nấu chính', en: 'Cook time' }, language)}
                                                </p>
                                                <h4 className="h5 fw-bold text-dark mb-0">
                                                    {translate(
                                                        {
                                                            vi: `${recipe.cookTime} phút`,
                                                            en: `${recipe.cookTime} min`,
                                                        },
                                                        language
                                                    )}
                                                </h4>
                                            </div>
                                            <div className="ttdn-order-item-card">
                                                <p className="small text-muted text-uppercase fw-semibold mb-1">
                                                    {translate({ vi: 'Tags', en: 'Tags' }, language)}
                                                </p>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {recipe.tags?.length ? (
                                                        recipe.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="badge bg-light text-muted rounded-pill px-3 py-2"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted">
                                                            {translate({ vi: 'Chưa có tag.', en: 'No tags yet.' }, language)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="ttdn-panel h-100">
                                        <p className="text-uppercase small fw-bold theme-color mb-1">
                                            {translate({ vi: 'Mua nguyên liệu', en: 'Shop ingredients' }, language)}
                                        </p>
                                        <h3 className="h4 fw-bold text-dark mb-3">
                                            {translate({ vi: 'Công thức và sản phẩm phù hợp', en: 'Recipe and matching products' }, language)}
                                        </h3>
                                        <div className="ttdn-inline-note mb-4">
                                            {translate(
                                                {
                                                    vi: 'Chọn nhanh các nguyên liệu đang có sẵn trong shop để hoàn thành món ăn thuận tiện hơn.',
                                                    en: 'Quickly choose ingredients already available in the shop to complete the dish more easily.',
                                                },
                                                language
                                            )}
                                        </div>

                                        <div className="d-flex flex-column gap-3">
                                            <Link
                                                to="/products"
                                                className="btn theme-bg-color text-white rounded-pill px-4"
                                            >
                                                {translate({ vi: 'Mua nguyên liệu trong shop', en: 'Shop ingredients' }, language)}
                                            </Link>
                                            <Link to="/recipes" className="btn btn-light rounded-pill px-4">
                                                {translate({ vi: 'Xem thêm công thức', en: 'View more recipes' }, language)}
                                            </Link>
                                            {!matchedProducts.length ? (
                                                <div className="d-flex gap-2 text-muted small">
                                                    <AlertCircle size={16} className="flex-shrink-0 mt-1" />
                                                    <span>
                                                        {translate(
                                                            {
                                                                vi: 'Hiện chưa có sản phẩm đang bán nào khớp với công thức này.',
                                                                en: 'There are no currently sold products matched to this recipe yet.',
                                                            },
                                                            language
                                                        )}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
