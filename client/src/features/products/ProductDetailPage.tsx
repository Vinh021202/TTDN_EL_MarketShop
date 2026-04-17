import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingCart, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ProductCard } from '@/features/products/components/ProductCard';
import { toast } from '@/components/ui';
import { formatDisplayCurrency, getIntlLocale, translate } from '@/features/shared/utils/displayPreferences';
import { reserveStock } from '@/features/cart/services/cartApi';
import { getProductById, getProducts, Product } from '@/features/products/services/productsApi';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useThemeStore } from '@/store/themeStore';

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const language = useThemeStore((state) => state.language);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const addItem = useCartStore((state) => state.addItem);
    const setReservationExpiry = useCartStore((state) => state.setReservationExpiry);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const copy = useMemo(
        () => ({
            loginToAdd: translate(
                {
                    vi: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
                    en: 'Please sign in before adding products to your cart.',
                },
                language
            ),
            addSuccess: (itemQuantity: number, unit: string, name: string) =>
                translate(
                    {
                        vi: `Đã thêm ${itemQuantity} ${unit} ${name} vào giỏ hàng.`,
                        en: `Added ${itemQuantity} ${unit} ${name} to your cart.`,
                    },
                    language
                ),
            addError: translate(
                { vi: 'Không thể thêm vào giỏ hàng', en: 'Unable to add this item to your cart' },
                language
            ),
            loadingTitle: translate({ vi: 'Đang tải chi tiết sản phẩm', en: 'Loading product details' }, language),
            loadingDescription: translate(
                { vi: 'Thông tin sản phẩm sẽ xuất hiện trong giây lát.', en: 'Product information will appear shortly.' },
                language
            ),
            missingTitle: translate({ vi: 'Không tìm thấy sản phẩm', en: 'Product not found' }, language),
            missingDescription: translate(
                {
                    vi: 'Có thể sản phẩm đã bị ẩn hoặc đường dẫn hiện tại không còn hợp lệ.',
                    en: 'This product may be hidden or the current link is no longer valid.',
                },
                language
            ),
            backToList: translate({ vi: 'Quay lại danh sách', en: 'Back to list' }, language),
            pageTag: translate({ vi: 'Chi tiết sản phẩm', en: 'Product details' }, language),
            home: translate({ vi: 'Trang chủ', en: 'Home' }, language),
            products: translate({ vi: 'Sản phẩm', en: 'Products' }, language),
            back: translate({ vi: 'Quay lại', en: 'Back' }, language),
            inStock: (count: number, unit: string) =>
                translate(
                    {
                        vi: `Còn ${count} ${unit}`,
                        en: `${count} ${unit} left`,
                    },
                    language
                ),
            outOfStock: translate({ vi: 'Hết hàng', en: 'Out of stock' }, language),
            noDescription: translate(
                { vi: 'Sản phẩm này chưa có mô tả chi tiết.', en: 'This product does not have a detailed description yet.' },
                language
            ),
            origin: translate({ vi: 'Nguồn gốc', en: 'Origin' }, language),
            storage: translate({ vi: 'Bảo quản', en: 'Storage' }, language),
            updating: translate({ vi: 'Đang cập nhật', en: 'Updating' }, language),
            defaultStorage: translate({ vi: 'Mặc định', en: 'Default' }, language),
            quantity: translate({ vi: 'Số lượng', en: 'Quantity' }, language),
            expiryPrefix: translate({ vi: 'Hạn sử dụng', en: 'Expiry date' }, language),
            expiryMissing: translate(
                { vi: 'Hạn sử dụng sẽ hiển thị khi có dữ liệu.', en: 'Expiry date will appear when data is available.' },
                language
            ),
            addToCart: translate({ vi: 'Thêm vào giỏ hàng', en: 'Add to cart' }, language),
            continueShopping: translate({ vi: 'Tiếp tục mua sắm', en: 'Continue shopping' }, language),
            quickTipTitle: translate({ vi: 'Mẹo mua nhanh', en: 'Quick tip' }, language),
            quickTipDescription: translate(
                {
                    vi: 'Thêm sản phẩm vào giỏ để giữ chỗ sớm và hoàn tất đơn hàng trong khung thời gian phù hợp.',
                    en: 'Add the item to your cart early to reserve it and complete checkout within the delivery window that suits you.',
                },
                language
            ),
            moreSuggestions: translate({ vi: 'Gợi ý thêm', en: 'More suggestions' }, language),
            relatedTitle: translate(
                { vi: 'Cùng nhóm sản phẩm này còn có', en: 'You may also like from this category' },
                language
            ),
            relatedHint: translate(
                {
                    vi: 'Gợi ý thêm những món cùng nhóm để mua tiện hơn',
                    en: 'More products from the same group to make shopping easier.',
                },
                language
            ),
        }),
        [language]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ['product', 'detail', id],
        queryFn: () => getProductById(id!),
        enabled: !!id,
    });

    const product = data?.product;

    useEffect(() => {
        setSelectedImageIndex(0);
        setQuantity(1);
    }, [product?._id]);

    const { data: relatedData } = useQuery({
        queryKey: ['products', 'related', product?.category?._id],
        queryFn: () =>
            getProducts({
                category: product?.category?._id,
                limit: 4,
            }),
        enabled: !!product?.category?._id,
        staleTime: 5 * 60 * 1000,
    });

    const relatedProducts = useMemo(
        () => relatedData?.products?.filter((item) => item._id !== product?._id).slice(0, 4) ?? [],
        [relatedData?.products, product?._id]
    );

    const currentImage = product?.images?.[selectedImageIndex] ?? product?.images?.[0];

    const addProductToCart = async (item: Product, itemQuantity: number) => {
        if (!item) {
            return;
        }

        if (!isAuthenticated) {
            toast.error(copy.loginToAdd);
            navigate('/login');
            return;
        }

        try {
            const response = await reserveStock({
                productId: item._id,
                quantity: itemQuantity,
            });

            addItem({
                productId: item._id,
                name: item.name,
                price: item.price,
                quantity: itemQuantity,
                unit: item.unit,
                image: item.images[0]?.url || '',
            });

            setReservationExpiry(new Date(response.expiresAt));
            toast.success(copy.addSuccess(itemQuantity, item.unit, item.name));
        } catch (cartError: any) {
            const message = cartError.response?.data?.error || copy.addError;
            toast.error(message);
        }
    };

    const handleAddToCart = async () => {
        if (!product) {
            return;
        }

        await addProductToCart(product, quantity);
    };

    const handleRelatedAddToCart = async (item: Product) => {
        await addProductToCart(item, 1);
    };

    if (isLoading) {
        return (
            <div className="section-b-space pt-5">
                <div className="container-fluid-lg">
                    <div className="ttdn-empty-state text-center">
                        <div className="spinner-border text-success mb-3" role="status" />
                        <h2 className="h4 fw-bold text-dark mb-2">{copy.loadingTitle}</h2>
                        <p className="text-muted mb-0">{copy.loadingDescription}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="section-b-space pt-5">
                <div className="container-fluid-lg">
                    <div className="ttdn-empty-state text-center">
                        <h2 className="h4 fw-bold text-dark mb-2">{copy.missingTitle}</h2>
                        <p className="text-muted mb-4">{copy.missingDescription}</p>
                        <Link to="/products" className="btn theme-bg-color text-white rounded-pill px-4">
                            {copy.backToList}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section-b-space pt-4 pt-md-5">
            <div className="container-fluid-lg">
                <section className="ttdn-page-hero mb-5">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <p className="text-uppercase small fw-bold text-white-50 mb-2">{copy.pageTag}</p>
                            <h1 className="display-6 fw-bold text-white mb-2">{product.name}</h1>
                            <div className="d-flex flex-wrap align-items-center gap-2 text-white-50">
                                <Link to="/" className="text-white-50 text-decoration-none">
                                    {copy.home}
                                </Link>
                                <span>/</span>
                                <Link to="/products" className="text-white-50 text-decoration-none">
                                    {copy.products}
                                </Link>
                                {product.category && (
                                    <>
                                        <span>/</span>
                                        <span>{product.category.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4 d-inline-flex align-items-center gap-2"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={16} />
                            {copy.back}
                        </button>
                    </div>
                </section>

                <div className="row g-4 align-items-start">
                    <div className="col-lg-6">
                        <div className="ttdn-image-panel">
                            <div className="ttdn-image-stage mb-3">
                                {currentImage ? (
                                    <img
                                        src={currentImage.url}
                                        alt={currentImage.alt || product.name}
                                        className="img-fluid"
                                        style={{ maxHeight: 380, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className="text-muted fs-1">
                                        <ShoppingCart size={48} />
                                    </div>
                                )}
                            </div>

                            {product.images.length > 1 && (
                                <div className="d-flex flex-wrap gap-3">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={`${image.url}-${index}`}
                                            type="button"
                                            className={`ttdn-thumb-button ${selectedImageIndex === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.alt || product.name}
                                                className="img-fluid w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="ttdn-summary-card">
                            {product.category && (
                                <p className="text-uppercase small fw-bold theme-color mb-2">{product.category.name}</p>
                            )}
                            <h2 className="display-6 fw-bold text-dark mb-3">{product.name}</h2>
                            <div className="d-flex flex-wrap align-items-end gap-3 mb-4">
                                <span className="ttdn-product-price">{formatDisplayCurrency(product.price)}</span>
                                <span className="text-muted">/ {product.unit}</span>
                                <span className={`badge rounded-pill ${product.stockQuantity > 0 ? 'text-bg-success' : 'text-bg-danger'}`}>
                                    {product.stockQuantity > 0
                                        ? copy.inStock(product.stockQuantity, product.unit)
                                        : copy.outOfStock}
                                </span>
                            </div>

                            <p className="text-muted mb-4">{product.description || copy.noDescription}</p>

                            <div className="row g-3 mb-4">
                                <div className="col-sm-6">
                                    <div className="ttdn-detail-card h-100">
                                        <p className="text-uppercase small fw-bold text-muted mb-2">{copy.origin}</p>
                                        <p className="mb-0 fw-semibold text-dark">{product.origin || copy.updating}</p>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="ttdn-detail-card h-100">
                                        <p className="text-uppercase small fw-bold text-muted mb-2">{copy.storage}</p>
                                        <p className="mb-0 fw-semibold text-dark">{product.storageType || copy.defaultStorage}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                                <div>
                                    <p className="text-uppercase small fw-bold text-muted mb-2">{copy.quantity}</p>
                                    <div className="ttdn-quantity-pill">
                                        <button
                                            type="button"
                                            className="btn btn-light rounded-circle"
                                            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="fw-bold px-2">{quantity}</span>
                                        <button
                                            type="button"
                                            className="btn btn-light rounded-circle"
                                            onClick={() => setQuantity((value) => Math.min(product.stockQuantity || 1, value + 1))}
                                            disabled={quantity >= product.stockQuantity}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-muted small">
                                    {product.expiryDate
                                        ? `${copy.expiryPrefix}: ${new Date(product.expiryDate).toLocaleDateString(getIntlLocale(language))}`
                                        : copy.expiryMissing}
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    className="btn theme-bg-color text-white rounded-pill px-4 py-3 d-inline-flex align-items-center gap-2"
                                    onClick={handleAddToCart}
                                    disabled={product.stockQuantity === 0}
                                >
                                    <ShoppingCart size={18} />
                                    {copy.addToCart}
                                </button>
                                <Link to="/products" className="btn btn-light rounded-pill px-4 py-3">
                                    {copy.continueShopping}
                                </Link>
                            </div>

                            <div className="ttdn-panel mt-4">
                                <div className="d-flex align-items-start gap-3">
                                    <ShieldCheck className="text-success flex-shrink-0" size={20} />
                                    <div>
                                        <p className="fw-semibold text-dark mb-1">{copy.quickTipTitle}</p>
                                        <p className="text-muted mb-0">{copy.quickTipDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="mt-5">
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                            <div>
                                <p className="text-uppercase small fw-bold theme-color mb-1">{copy.moreSuggestions}</p>
                                <h2 className="h3 fw-bold text-dark mb-0">{copy.relatedTitle}</h2>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted">
                                <Sparkles size={16} />
                                <span>{copy.relatedHint}</span>
                            </div>
                        </div>

                        <div className="row g-4">
                            {relatedProducts.map((item) => (
                                <div key={item._id} className="col-md-6 col-xl-3">
                                    <ProductCard product={item} onAddToCart={handleRelatedAddToCart} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
