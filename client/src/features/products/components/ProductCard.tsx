import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDisplayCurrency, translate } from '@/features/shared/utils/displayPreferences';
import { Product } from '@/features/products/services/productsApi';
import { useThemeStore } from '@/store/themeStore';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
    const language = useThemeStore((state) => state.language);
    const imageUrl = product.images?.[0]?.url;
    const isInStock = product.stockQuantity > 0;

    return (
        <motion.article whileHover={{ y: -6 }} className="ttdn-product-card">
            <Link to={`/products/${product._id}`} className="d-block position-relative text-decoration-none">
                <div className="ttdn-product-media">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.images[0]?.alt || product.name}
                            className="img-fluid ttdn-product-image"
                        />
                    ) : (
                        <div className="d-flex align-items-center justify-content-center w-100 h-100 text-muted fs-1">
                            <ShoppingCart size={40} />
                        </div>
                    )}
                    {product.isNearExpiry && (
                        <span className="ttdn-product-ribbon">
                            {translate({ vi: 'Sắp hết hạn', en: 'Near expiry' }, language)}
                        </span>
                    )}
                </div>
            </Link>

            <div className="ttdn-product-body">
                {product.category && (
                    <p className="text-uppercase small fw-semibold theme-color mb-2">{product.category.name}</p>
                )}

                <Link to={`/products/${product._id}`} className="text-decoration-none">
                    <h3 className="ttdn-product-title ttdn-clamp-2">{product.name}</h3>
                </Link>

                <div className="ttdn-product-meta d-flex align-items-end justify-content-between gap-2 mb-3">
                    <div>
                        <p className="ttdn-product-price mb-0">{formatDisplayCurrency(product.price)}</p>
                        <small className="text-muted">/ {product.unit}</small>
                    </div>
                    <span className={`badge rounded-pill ${isInStock ? 'text-bg-success' : 'text-bg-danger'}`}>
                        {isInStock
                            ? translate(
                                  {
                                      vi: `Còn ${product.stockQuantity}`,
                                      en: `${product.stockQuantity} left`,
                                  },
                                  language
                              )
                            : translate({ vi: 'Hết hàng', en: 'Out of stock' }, language)}
                    </span>
                </div>

                <button
                    type="button"
                    className="ttdn-product-action btn theme-bg-color text-white rounded-pill w-100 d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={() => onAddToCart?.(product)}
                    disabled={!isInStock}
                >
                    <ShoppingCart size={16} />
                    {translate({ vi: 'Thêm vào giỏ', en: 'Add to cart' }, language)}
                </button>
            </div>
        </motion.article>
    );
};

