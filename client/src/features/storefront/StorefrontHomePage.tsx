import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { ProductCard } from '@/features/products/components/ProductCard';
import { AutoCutoutImage } from '@/components/ui/AutoCutoutImage';
import { toast } from '@/components/ui';
import { Category, getCategories } from '@/features/shared/api/categoriesApi';
import { translate } from '@/features/shared/utils/displayPreferences';
import { reserveStock } from '@/features/cart/services/cartApi';
import { getProducts, Product } from '@/features/products/services/productsApi';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';

interface StorefrontCategoryVisualProps {
    category: Category;
    imageSources: string[];
}

function StorefrontCategoryVisual({ category, imageSources }: StorefrontCategoryVisualProps) {
    const normalizedSources = useMemo(
        () => Array.from(new Set(imageSources.filter((source): source is string => Boolean(source)))),
        [imageSources]
    );
    const sourceKey = normalizedSources.join('|');
    const [sourceIndex, setSourceIndex] = useState(0);

    useEffect(() => {
        setSourceIndex(0);
    }, [sourceKey]);

    const activeSource = normalizedSources[sourceIndex];

    return (
        <div className="ttdn-category-card__media">
            {activeSource ? (
                <AutoCutoutImage
                    src={activeSource}
                    alt={category.name}
                    className="ttdn-category-card__image"
                    loading="lazy"
                    onError={() => setSourceIndex((current) => current + 1)}
                />
            ) : (
                <span className="ttdn-category-card__fallback">{category.name.charAt(0).toUpperCase()}</span>
            )}
        </div>
    );
}

export function StorefrontHomePage() {
    const navigate = useNavigate();
    const language = useThemeStore((state) => state.language);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addItem = useCartStore((state) => state.addItem);
    const setReservationExpiry = useCartStore((state) => state.setReservationExpiry);

    const benefitCards = useMemo(
        () => [
            {
                title: translate({ vi: 'Nguồn hàng tươi mới', en: 'Fresh arrivals every day' }, language),
                description: translate(
                    {
                        vi: 'Chọn nhanh nông sản, thực phẩm sạch và các món thiết yếu cho bữa ăn mỗi ngày.',
                        en: 'Pick produce, clean foods, and daily essentials in a cleaner shopping flow.',
                    },
                    language
                ),
                icon: Leaf,
            },
            {
                title: translate({ vi: 'Giao nhanh trong ngày', en: 'Same-day delivery' }, language),
                description: translate(
                    {
                        vi: 'Lướt danh mục rõ ràng, thêm hàng nhanh và chốt đơn thuận tiện trong ngày.',
                        en: 'Browse organized categories, add faster, and complete your order with less friction.',
                    },
                    language
                ),
                icon: Truck,
            },
            {
                title: translate({ vi: 'Gợi ý dễ chọn', en: 'Helpful suggestions' }, language),
                description: translate(
                    {
                        vi: 'Danh mục, công thức và sản phẩm liên kết liền mạch để bạn lên thực đơn nhanh hơn.',
                        en: 'Categories, recipes, and products stay connected so meal planning feels easier.',
                    },
                    language
                ),
                icon: Sparkles,
            },
        ],
        [language]
    );

    const copy = useMemo(
        () => ({
            eyebrow: 'TTDN Market',
            heroTitle: translate(
                {
                    vi: 'Mua thực phẩm tươi với giao diện sáng hơn, rõ hơn, nhanh hơn.',
                    en: 'Buy fresh food in a brighter, clearer, faster storefront.',
                },
                language
            ),
            heroDescription: translate(
                {
                    vi: 'Từ rau củ, trái cây đến nguyên liệu nấu ăn, mọi thứ đã được sắp xếp gọn gàng để bạn tìm món cần mua nhanh hơn.',
                    en: 'From vegetables and fruit to cooking essentials, everything is arranged so you can find what you need faster.',
                },
                language
            ),
            exploreProducts: translate({ vi: 'Khám phá sản phẩm', en: 'Explore products' }, language),
            quickSearchVegetables: translate({ vi: 'Tìm nhanh rau củ', en: 'Quick search vegetables' }, language),
            todayStore: translate({ vi: 'Cửa hàng hôm nay', en: 'Today in store' }, language),
            todayStoreTitle: translate(
                {
                    vi: 'Nguồn thực phẩm tươi được gom lại trong một không gian mua sắm gọn mắt.',
                    en: 'Fresh food is gathered into one cleaner and easier shopping space.',
                },
                language
            ),
            todayStoreDescription: translate(
                {
                    vi: 'Duyệt danh mục, xem chi tiết và thêm vào giỏ hàng chỉ trong vài bước ngắn.',
                    en: 'Browse categories, open details, and add to cart in just a few simple steps.',
                },
                language
            ),
            featuredCategories: translate({ vi: 'Danh mục nổi bật', en: 'Featured categories' }, language),
            stockedProducts: translate({ vi: 'Sản phẩm đang lên kệ', en: 'Products on shelf' }, language),
            categoriesTag: translate({ vi: 'Danh mục', en: 'Categories' }, language),
            categoriesTitle: translate(
                {
                    vi: 'Đi nhanh tới nhóm sản phẩm bạn cần',
                    en: 'Jump straight to the product groups you need',
                },
                language
            ),
            viewShop: translate({ vi: 'Xem toàn bộ shop', en: 'View full shop' }, language),
            featuredProductsTag: translate({ vi: 'Sản phẩm nổi bật', en: 'Featured products' }, language),
            featuredProductsTitle: translate(
                {
                    vi: 'Những món nên bắt đầu ngay hôm nay',
                    en: 'Good picks to start with today',
                },
                language
            ),
            featuredProductsHint: translate(
                {
                    vi: 'Chọn nhanh những món được quan tâm nhiều trong hôm nay.',
                    en: 'Quickly browse the items customers are paying attention to today.',
                },
                language
            ),
            addToCartLoginError: translate(
                {
                    vi: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
                    en: 'Please sign in before adding products to your cart.',
                },
                language
            ),
            addToCartSuccess: (productName: string) =>
                translate(
                    {
                        vi: `Đã thêm ${productName} vào giỏ hàng.`,
                        en: `${productName} was added to your cart.`,
                    },
                    language
                ),
            addToCartError: translate(
                {
                    vi: 'Không thể thêm vào giỏ hàng',
                    en: 'Unable to add this item to your cart',
                },
                language
            ),
            availableProducts: (count: number) =>
                translate(
                    {
                        vi: `${count} sản phẩm đang có`,
                        en: `${count} products available`,
                    },
                    language
                ),
            openCategoryHint: translate(
                {
                    vi: 'Mở nhanh danh sách để xem sản phẩm phù hợp.',
                    en: 'Open the list to explore products in this category.',
                },
                language
            ),
        }),
        [language]
    );

    const { data: categoryData } = useQuery({
        queryKey: ['categories', 'storefront-home'],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
    });

    const { data: productData, isLoading } = useQuery({
        queryKey: ['products', 'storefront-home'],
        queryFn: () => getProducts({ limit: 100 }),
        staleTime: 5 * 60 * 1000,
    });

    const categories = categoryData?.categories?.slice(0, 6) ?? [];
    const allProducts = productData?.products ?? [];
    const products = allProducts.slice(0, 8);
    const categoryImageMap = useMemo(() => {
        const imageMap = new Map<string, string>();

        allProducts.forEach((product) => {
            const primaryImage = product.images.find((image) => image?.url)?.url;
            if (!primaryImage) {
                return;
            }

            if (!imageMap.has(product.category._id)) {
                imageMap.set(product.category._id, primaryImage);
            }

            if (!imageMap.has(product.category.slug)) {
                imageMap.set(product.category.slug, primaryImage);
            }
        });

        return imageMap;
    }, [allProducts]);

    const handleAddToCart = async (product: Product) => {
        if (!isAuthenticated) {
            toast.error(copy.addToCartLoginError);
            navigate('/login');
            return;
        }

        try {
            const response = await reserveStock({
                productId: product._id,
                quantity: 1,
            });

            addItem({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                unit: product.unit,
                image: product.images[0]?.url || '',
            });

            setReservationExpiry(new Date(response.expiresAt));
            toast.success(copy.addToCartSuccess(product.name));
        } catch (error: any) {
            const message = error.response?.data?.error || copy.addToCartError;
            toast.error(message);
        }
    };

    return (
        <div className="section-b-space pt-4 pt-md-5">
            <div className="container-fluid-lg">
                <section className="ttdn-hero mb-5">
                    <div className="row align-items-center g-4 position-relative">
                        <div className="col-lg-7 position-relative">
                            <span className="ttdn-hero-eyebrow">
                                <Sparkles size={16} />
                                {copy.eyebrow}
                            </span>
                            <h1 className="display-5 fw-bold text-white mb-3">{copy.heroTitle}</h1>
                            <p className="lead text-white-50 mb-4">{copy.heroDescription}</p>
                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/products" className="btn rounded-pill px-4 py-3 fw-semibold ttdn-hero-action">
                                    {copy.exploreProducts}
                                </Link>
                                <Link
                                    to="/products?search=rau"
                                    className="btn rounded-pill px-4 py-3 fw-semibold ttdn-hero-action"
                                >
                                    {copy.quickSearchVegetables}
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="ttdn-hero-stats">
                                        <p className="mb-1 text-white-50 text-uppercase small fw-bold">{copy.todayStore}</p>
                                        <h3 className="mb-2 text-white">{copy.todayStoreTitle}</h3>
                                        <p className="mb-0 text-white-50">{copy.todayStoreDescription}</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="ttdn-hero-stats h-100">
                                        <p className="mb-1 text-white-50">{copy.featuredCategories}</p>
                                        <h3 className="mb-0 text-white">{categories.length || '--'}</h3>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="ttdn-hero-stats h-100">
                                        <p className="mb-1 text-white-50">{copy.stockedProducts}</p>
                                        <h3 className="mb-0 text-white">{products.length || '--'}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-5">
                    <div className="row g-4">
                        {benefitCards.map((card) => (
                            <div key={card.title} className="col-md-4">
                                <div className="ttdn-feature-card">
                                    <div
                                        className="d-inline-flex align-items-center justify-content-center rounded-circle theme-bg-color text-white mb-3"
                                        style={{ width: 52, height: 52 }}
                                    >
                                        <card.icon size={22} />
                                    </div>
                                    <h3 className="h5 fw-bold text-dark">{card.title}</h3>
                                    <p className="text-muted mb-0">{card.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-5">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                        <div>
                            <p className="text-uppercase small fw-bold theme-color mb-1">{copy.categoriesTag}</p>
                            <h2 className="fw-bold text-dark mb-0">{copy.categoriesTitle}</h2>
                        </div>
                        <Link to="/products" className="btn btn-light rounded-pill px-4 fw-semibold">
                            {copy.viewShop}
                        </Link>
                    </div>

                    <div className="row g-4">
                        {categories.map((category) => (
                            <div key={category._id} className="col-md-4 col-xl-2">
                                <Link
                                    to={`/products?category=${category._id}`}
                                    className="ttdn-category-card d-block text-decoration-none h-100"
                                >
                                    <StorefrontCategoryVisual
                                        category={category}
                                        imageSources={[
                                            categoryImageMap.get(category._id) ?? '',
                                            categoryImageMap.get(category.slug) ?? '',
                                            category.image ?? '',
                                        ]}
                                    />
                                    <h3 className="h6 fw-bold text-dark mb-2">{category.name}</h3>
                                    <p className="text-muted small mb-0">
                                        {category.productsCount
                                            ? copy.availableProducts(category.productsCount)
                                            : copy.openCategoryHint}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                        <div>
                            <p className="text-uppercase small fw-bold theme-color mb-1">{copy.featuredProductsTag}</p>
                            <h2 className="fw-bold text-dark mb-0">{copy.featuredProductsTitle}</h2>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted">
                            <ShoppingBag size={18} />
                            <span>{copy.featuredProductsHint}</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="row g-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="col-sm-6 col-xl-3">
                                    <div className="ttdn-product-card">
                                        <div className="ttdn-product-media">
                                            <div className="placeholder-glow w-100">
                                                <span className="placeholder col-12" style={{ height: 180, borderRadius: 24 }} />
                                            </div>
                                        </div>
                                        <div className="ttdn-product-body">
                                            <div className="placeholder-glow">
                                                <span className="placeholder col-5 mb-3" />
                                                <span className="placeholder col-10 mb-2" />
                                                <span className="placeholder col-8 mb-4" />
                                                <span className="placeholder col-12" style={{ height: 44, borderRadius: 999 }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="row g-4">
                            {products.map((product) => (
                                <div key={product._id} className="col-sm-6 col-xl-3">
                                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
