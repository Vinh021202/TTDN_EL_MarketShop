import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/features/products/components/ProductCard';
import { toast } from '@/components/ui';
import { reserveStock } from '@/features/cart/services/cartApi';
import { getCategories } from '@/features/shared/api/categoriesApi';
import { getProducts, Product } from '@/features/products/services/productsApi';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';

export const ProductListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const language = useThemeStore((state) => state.language);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addItem = useCartStore((state) => state.addItem);
    const setReservationExpiry = useCartStore((state) => state.setReservationExpiry);
    const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const copy = useMemo(
        () => ({
            heroTag: translate({ vi: 'Danh mục mua sắm', en: 'Shopping catalog' }, language),
            heroTitle: translate(
                {
                    vi: 'Kho sản phẩm tươi sống cho từng bữa ăn trong ngày.',
                    en: 'A fresh product library for every meal of the day.',
                },
                language
            ),
            heroDescription: translate(
                {
                    vi: 'Lọc nhanh theo danh mục hoặc từ khóa để tìm đúng món bạn đang cần.',
                    en: 'Filter by category or keyword to quickly find the items you need.',
                },
                language
            ),
            viewingAllCategories: translate({ vi: 'Đang xem toàn bộ danh mục', en: 'Browsing all categories' }, language),
            filteringCategory: (categoryName: string) =>
                translate(
                    {
                        vi: `Đang lọc theo ${categoryName}`,
                        en: `Filtering by ${categoryName}`,
                    },
                    language
                ),
            productCount: (count: number | string) =>
                translate(
                    {
                        vi: `${count} sản phẩm`,
                        en: `${count} products`,
                    },
                    language
                ),
            quickFilter: translate({ vi: 'Bộ lọc nhanh', en: 'Quick filters' }, language),
            searchPlaceholder: translate({ vi: 'Tìm theo tên sản phẩm...', en: 'Search by product name...' }, language),
            allCategories: translate({ vi: 'Tất cả danh mục', en: 'All categories' }, language),
            clearFilters: translate({ vi: 'Xóa lọc', en: 'Clear filters' }, language),
            listTag: translate({ vi: 'Danh sách sản phẩm', en: 'Product list' }, language),
            listTitle: translate({ vi: 'Mua sắm theo nhu cầu của bạn', en: 'Shop around your needs' }, language),
            currentKeyword: (term: string) =>
                translate(
                    {
                        vi: `Từ khóa hiện tại: "${term}".`,
                        en: `Current keyword: "${term}".`,
                    },
                    language
                ),
            defaultHint: translate(
                {
                    vi: 'Chọn danh mục hoặc tìm kiếm để thu hẹp danh sách.',
                    en: 'Choose a category or search term to narrow the list.',
                },
                language
            ),
            pageLabel: (currentPage: number, totalPages: number) =>
                translate(
                    {
                        vi: `Trang ${currentPage} / ${totalPages}`,
                        en: `Page ${currentPage} / ${totalPages}`,
                    },
                    language
                ),
            loadingErrorTitle: translate({ vi: 'Không thể tải sản phẩm', en: 'Unable to load products' }, language),
            loadingErrorDescription: translate(
                { vi: 'Vui lòng thử lại sau vài phút.', en: 'Please try again in a few minutes.' },
                language
            ),
            noResultsTitle: translate({ vi: 'Không có kết quả phù hợp', en: 'No matching products found' }, language),
            noResultsDescription: translate(
                {
                    vi: 'Hãy thử từ khóa khác hoặc bỏ bộ lọc hiện tại.',
                    en: 'Try another keyword or remove the current filters.',
                },
                language
            ),
            refreshList: translate({ vi: 'Làm mới danh sách', en: 'Refresh list' }, language),
            previousPage: translate({ vi: 'Trang trước', en: 'Previous page' }, language),
            currentView: (visible: number, total: number) =>
                translate(
                    {
                        vi: `Đang xem ${visible} / ${total} sản phẩm`,
                        en: `Showing ${visible} / ${total} products`,
                    },
                    language
                ),
            nextPage: translate({ vi: 'Trang sau', en: 'Next page' }, language),
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
        }),
        [language]
    );

    const { data: categoryData } = useQuery({
        queryKey: ['categories', 'storefront-list'],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', 'storefront-list', page, search, category],
        queryFn: () =>
            getProducts({
                page,
                limit: 12,
                search: search || undefined,
                category: category || undefined,
            }),
    });

    const categories = categoryData?.categories ?? [];
    const selectedCategoryName = useMemo(
        () => categories.find((item) => item._id === category)?.name,
        [categories, category]
    );

    const updateSearchParams = (updates: Record<string, string | null>) => {
        const next = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (!value) {
                next.delete(key);
            } else {
                next.set(key, value);
            }
        });

        setSearchParams(next);
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        updateSearchParams({
            search: searchInput.trim() || null,
            page: null,
        });
    };

    const handleCategorySelect = (categoryId: string | null) => {
        updateSearchParams({
            category: categoryId,
            page: null,
        });
    };

    const handlePageChange = (nextPage: number) => {
        updateSearchParams({ page: String(nextPage) });
    };

    const handleResetFilters = () => {
        setSearchInput('');
        setSearchParams(new URLSearchParams());
    };

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
        } catch (cartError: any) {
            const message = cartError.response?.data?.error || copy.addToCartError;
            toast.error(message);
        }
    };

    return (
        <div className="section-b-space pt-4 pt-md-5">
            <div className="container-fluid-lg">
                <section className="ttdn-page-hero mb-5">
                    <div className="row align-items-center g-3">
                        <div className="col-lg-7">
                            <p className="text-uppercase small fw-bold mb-2 text-white-50">{copy.heroTag}</p>
                            <h1 className="display-6 fw-bold text-white mb-2">{copy.heroTitle}</h1>
                            <p className="mb-0 text-white-50">{copy.heroDescription}</p>
                        </div>
                        <div className="col-lg-5">
                            <div className="ttdn-hero-stats">
                                <p className="mb-1 text-white-50">
                                    {selectedCategoryName
                                        ? copy.filteringCategory(selectedCategoryName)
                                        : copy.viewingAllCategories}
                                </p>
                                <h3 className="mb-0 text-white">{copy.productCount(data?.pagination.total ?? '--')}</h3>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="row g-4 align-items-start">
                    <div className="col-xl-3 ttdn-product-filter-column">
                        <div className="ttdn-panel ttdn-product-filter-panel mb-4">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <SlidersHorizontal size={18} className="text-success" />
                                <h2 className="h5 fw-bold mb-0 text-dark">{copy.quickFilter}</h2>
                            </div>

                            <form className="mb-4" onSubmit={handleSearchSubmit}>
                                <div className="storefront-search-shell">
                                    <Search size={18} className="text-success flex-shrink-0" />
                                    <input
                                        type="search"
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder={copy.searchPlaceholder}
                                        className="storefront-search-input"
                                    />
                                </div>
                            </form>

                            <div className="d-grid gap-2">
                                <button
                                    type="button"
                                    className={`ttdn-filter-button ${category ? '' : 'active'}`}
                                    onClick={() => handleCategorySelect(null)}
                                >
                                    <span>{copy.allCategories}</span>
                                    <span className="small text-muted">{data?.pagination.total ?? 0}</span>
                                </button>
                                {categories.map((item) => (
                                    <button
                                        key={item._id}
                                        type="button"
                                        className={`ttdn-filter-button ${category === item._id ? 'active' : ''}`}
                                        onClick={() => handleCategorySelect(item._id)}
                                    >
                                        <span>{item.name}</span>
                                        <span className="small text-muted">{item.productsCount ?? '...'}</span>
                                    </button>
                                ))}
                            </div>

                            <button type="button" className="btn btn-light rounded-pill w-100 mt-4" onClick={handleResetFilters}>
                                {copy.clearFilters}
                            </button>
                        </div>
                    </div>

                    <div className="col-xl-9">
                        <div className="ttdn-panel mb-4">
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                                <div>
                                    <p className="text-uppercase small fw-bold theme-color mb-1">{copy.listTag}</p>
                                    <h2 className="h4 fw-bold text-dark mb-1">{copy.listTitle}</h2>
                                    <p className="text-muted mb-0">{search ? copy.currentKeyword(search) : copy.defaultHint}</p>
                                </div>
                                <div className="text-muted small">{copy.pageLabel(page, data?.pagination.totalPages ?? 1)}</div>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="row g-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="col-md-6 col-xxl-4">
                                        <div className="ttdn-product-card">
                                            <div className="ttdn-product-media">
                                                <div className="placeholder-glow w-100">
                                                    <span className="placeholder col-12" style={{ height: 180, borderRadius: 24 }} />
                                                </div>
                                            </div>
                                            <div className="ttdn-product-body">
                                                <div className="placeholder-glow">
                                                    <span className="placeholder col-4 mb-3" />
                                                    <span className="placeholder col-10 mb-2" />
                                                    <span className="placeholder col-7 mb-4" />
                                                    <span className="placeholder col-12" style={{ height: 44, borderRadius: 999 }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="ttdn-empty-state text-center">
                                <h3 className="h4 fw-bold text-dark mb-2">{copy.loadingErrorTitle}</h3>
                                <p className="text-muted mb-0">{copy.loadingErrorDescription}</p>
                            </div>
                        )}

                        {!isLoading && data && data.products.length === 0 && (
                            <div className="ttdn-empty-state text-center">
                                <h3 className="h4 fw-bold text-dark mb-2">{copy.noResultsTitle}</h3>
                                <p className="text-muted mb-3">{copy.noResultsDescription}</p>
                                <button
                                    type="button"
                                    className="btn theme-bg-color text-white rounded-pill px-4"
                                    onClick={handleResetFilters}
                                >
                                    {copy.refreshList}
                                </button>
                            </div>
                        )}

                        {!isLoading && data && data.products.length > 0 && (
                            <>
                                <div className="row g-4">
                                    {data.products.map((product) => (
                                        <div key={product._id} className="col-md-6 col-xxl-4">
                                            <ProductCard product={product} onAddToCart={handleAddToCart} />
                                        </div>
                                    ))}
                                </div>

                                {data.pagination.totalPages > 1 && (
                                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5">
                                        <button
                                            type="button"
                                            className="btn btn-light rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft size={16} />
                                            {copy.previousPage}
                                        </button>

                                        <div className="text-muted small">{copy.currentView(data.products.length, data.pagination.total)}</div>

                                        <button
                                            type="button"
                                            className="btn theme-bg-color text-white rounded-pill px-4 d-inline-flex align-items-center gap-2"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page >= data.pagination.totalPages}
                                        >
                                            {copy.nextPage}
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
