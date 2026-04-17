import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Clock3, Filter, Leaf, RefreshCw, Search, Sparkles } from 'lucide-react';
import { getRecipes, type Recipe } from './services/recipeApi';
import { StorefrontBreadcrumb } from '@/features/storefront/components/StorefrontBreadcrumb';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';

const difficultyClassNames: Record<string, string> = {
    de: 'bg-success-subtle text-success-emphasis',
    'trung binh': 'bg-warning-subtle text-warning-emphasis',
    kho: 'bg-danger-subtle text-danger-emphasis',
    easy: 'bg-success-subtle text-success-emphasis',
    medium: 'bg-warning-subtle text-warning-emphasis',
    hard: 'bg-danger-subtle text-danger-emphasis',
};

const fallbackGradients = [
    'linear-gradient(135deg, rgba(13,164,135,0.95), rgba(24,111,80,0.88))',
    'linear-gradient(135deg, rgba(245,158,11,0.95), rgba(234,88,12,0.88))',
    'linear-gradient(135deg, rgba(14,165,233,0.95), rgba(37,99,235,0.88))',
    'linear-gradient(135deg, rgba(168,85,247,0.95), rgba(236,72,153,0.88))',
];

const normalize = (value?: string) =>
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export function RecipesPage() {
    const language = useThemeStore((state) => state.language);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [mood, setMood] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [maxTime, setMaxTime] = useState('');
    const [loading, setLoading] = useState(true);

    const moodFilters = useMemo(
        () => [
            { value: '', label: translate({ vi: 'Tất cả', en: 'All' }, language) },
            { value: 'daily', label: translate({ vi: 'Hằng ngày', en: 'Daily' }, language) },
            { value: 'quick', label: translate({ vi: 'Nhanh <20p', en: 'Quick <20m' }, language) },
            { value: 'healthy', label: translate({ vi: 'Lành mạnh', en: 'Healthy' }, language) },
            { value: 'family', label: translate({ vi: 'Gia đình', en: 'Family' }, language) },
            { value: 'comfort', label: translate({ vi: 'Ấm áp', en: 'Comfort' }, language) },
        ],
        [language]
    );

    const copy = useMemo(
        () => ({
            breadcrumbTitle: translate({ vi: 'Kho công thức', en: 'Recipe library' }, language),
            breadcrumbSubtitle: translate(
                {
                    vi: 'Khám phá công thức nấu ăn, lọc theo mood hoặc thời gian và nối ngược lại với sản phẩm đang bán.',
                    en: 'Explore recipes, filter by mood or time, and jump back to matching products in the shop.',
                },
                language
            ),
            heroTag: translate({ vi: 'Góc bếp mỗi ngày', en: 'Kitchen corner' }, language),
            heroTitle: translate(
                {
                    vi: 'Chọn món, lên thực đơn và tìm nguyên liệu nấu ăn ngay trong cùng một nơi.',
                    en: 'Choose meals, plan your menu, and find ingredients in one connected place.',
                },
                language
            ),
            heroDescription: translate(
                {
                    vi: 'Duyệt công thức theo khẩu vị, thời gian chuẩn bị và mở nhanh sang sản phẩm phù hợp.',
                    en: 'Browse recipes by taste, prep time, and jump quickly to matching products.',
                },
                language
            ),
            totalRecipes: translate({ vi: 'Tổng công thức', en: 'Total recipes' }, language),
            activeFilter: translate({ vi: 'Bộ lọc hiện tại', en: 'Current filter' }, language),
            filterActive: translate({ vi: 'Đã áp dụng', en: 'Applied' }, language),
            filterDefault: translate({ vi: 'Mặc định', en: 'Default' }, language),
            searchPlaceholder: translate(
                { vi: 'Tìm theo tên món, nguyên liệu, tag...', en: 'Search by dish, ingredient, tag...' },
                language
            ),
            searchButton: translate({ vi: 'Tìm', en: 'Search' }, language),
            timeLabel: translate({ vi: 'Thời gian', en: 'Time' }, language),
            reset: translate({ vi: 'Làm mới', en: 'Reset' }, language),
            emptyTitle: translate({ vi: 'Không tìm thấy công thức phù hợp', en: 'No matching recipes found' }, language),
            emptyDescription: translate(
                {
                    vi: 'Thử đổi từ khóa, bỏ filter hiện tại hoặc quay về chế độ xem mặc định.',
                    en: 'Try a different keyword, remove the current filters, or go back to the default view.',
                },
                language
            ),
            featured: translate({ vi: 'Nổi bật', en: 'Featured' }, language),
            minutes: translate({ vi: 'phút', en: 'min' }, language),
            servings: translate({ vi: 'phần', en: 'servings' }, language),
            noDescription: translate(
                {
                    vi: 'Mở chi tiết để xem nguyên liệu, thời gian và các bước thực hiện.',
                    en: 'Open the details to view ingredients, timing, and cooking steps.',
                },
                language
            ),
        }),
        [language]
    );

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);

            try {
                const data = await getRecipes({
                    page,
                    limit: 12,
                    mood: mood || undefined,
                    q: search || undefined,
                    maxTime: maxTime ? parseInt(maxTime, 10) : undefined,
                });

                setRecipes(data.recipes || []);
                setTotal(data.pagination?.total || 0);
                setTotalPages(data.pagination?.totalPages || 1);
            } catch {
                setRecipes([]);
                setTotal(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [maxTime, mood, page, search]);

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    const handleReset = () => {
        setSearchInput('');
        setSearch('');
        setMood('');
        setMaxTime('');
        setPage(1);
    };

    return (
        <>
            <StorefrontBreadcrumb
                title={copy.breadcrumbTitle}
                items={[{ label: copy.breadcrumbTitle }]}
                subtitle={copy.breadcrumbSubtitle}
            />

            <section className="blog-section section-b-space">
                <div className="container-fluid-lg">
                    <div className="ttdn-page-hero mb-5">
                        <div className="row align-items-center g-4">
                            <div className="col-lg-8">
                                <p className="text-uppercase small fw-bold text-white-50 mb-2">{copy.heroTag}</p>
                                <h2 className="display-6 fw-bold text-white mb-3">{copy.heroTitle}</h2>
                                <p className="text-white-50 mb-0">{copy.heroDescription}</p>
                            </div>
                            <div className="col-lg-4">
                                <div className="row g-3">
                                    <div className="col-sm-6 col-lg-12">
                                        <div className="ttdn-hero-stats">
                                            <p className="mb-1 text-white-50">{copy.totalRecipes}</p>
                                            <h3 className="mb-0 text-white">{total}</h3>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-lg-12">
                                        <div className="ttdn-hero-stats">
                                            <p className="mb-1 text-white-50">{copy.activeFilter}</p>
                                            <h3 className="mb-0 text-white">
                                                {mood || maxTime || search ? copy.filterActive : copy.filterDefault}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ttdn-panel mb-4">
                        <div className="row g-3 align-items-center">
                            <div className="col-lg-6">
                                <form onSubmit={handleSearch}>
                                    <div className="storefront-search-shell">
                                        <Search size={18} className="text-success flex-shrink-0" />
                                        <input
                                            type="search"
                                            value={searchInput}
                                            onChange={(event) => setSearchInput(event.target.value)}
                                            className="storefront-search-input"
                                            placeholder={copy.searchPlaceholder}
                                        />
                                        <button type="submit" className="btn theme-bg-color text-white rounded-pill px-4">
                                            {copy.searchButton}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="col-lg-6">
                                <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                                    {moodFilters.map((filter) => (
                                        <button
                                            key={filter.value || 'all'}
                                            type="button"
                                            className={`btn rounded-pill px-3 ${mood === filter.value ? 'theme-bg-color text-white' : 'btn-light text-dark'}`}
                                            onClick={() => {
                                                setMood(filter.value);
                                                setPage(1);
                                            }}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}

                                    <div className="d-flex align-items-center gap-2 px-3 bg-white rounded-pill border">
                                        <Filter size={14} className="text-success" />
                                        <select
                                            value={maxTime}
                                            onChange={(event) => {
                                                setMaxTime(event.target.value);
                                                setPage(1);
                                            }}
                                            className="border-0 bg-transparent py-2 text-muted"
                                        >
                                            <option value="">{copy.timeLabel}</option>
                                            <option value="10">{language === 'vi' ? '≤ 10 phút' : '≤ 10 min'}</option>
                                            <option value="20">{language === 'vi' ? '≤ 20 phút' : '≤ 20 min'}</option>
                                            <option value="30">{language === 'vi' ? '≤ 30 phút' : '≤ 30 min'}</option>
                                            <option value="60">{language === 'vi' ? '≤ 60 phút' : '≤ 60 min'}</option>
                                        </select>
                                    </div>

                                    <button type="button" className="btn btn-light rounded-pill" onClick={handleReset}>
                                        <RefreshCw size={14} className="me-2" />
                                        {copy.reset}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="row g-4">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="col-md-6 col-xl-4">
                                    <div className="ttdn-panel placeholder-glow">
                                        <span className="placeholder col-12 mb-3" style={{ height: 200 }}></span>
                                        <span className="placeholder col-8 mb-2"></span>
                                        <span className="placeholder col-6"></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="ttdn-empty-state text-center">
                            <Leaf size={46} className="mx-auto text-success mb-3" />
                            <h3 className="fw-bold text-dark mb-2">{copy.emptyTitle}</h3>
                            <p className="text-content mb-0">{copy.emptyDescription}</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {recipes.map((recipe, index) => {
                                const totalTime = recipe.totalTime || recipe.prepTime + recipe.cookTime;
                                const gradient = fallbackGradients[index % fallbackGradients.length];
                                const normalizedDifficulty = normalize(recipe.difficulty);

                                return (
                                    <div key={recipe._id} className="col-md-6 col-xl-4">
                                        <article className="ttdn-panel ttdn-recipe-grid-card h-100">
                                            <div className="ttdn-recipe-grid-card__media">
                                                <Link
                                                    to={`/recipes/${recipe.slug}`}
                                                    className="ttdn-recipe-grid-card__image-link"
                                                >
                                                    {recipe.thumbnail ? (
                                                        <img
                                                            src={recipe.thumbnail}
                                                            alt={recipe.name}
                                                            className="ttdn-recipe-grid-card__image"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="ttdn-blog-fallback ttdn-recipe-grid-card__fallback"
                                                            style={{ background: gradient }}
                                                        >
                                                            <ChefHat size={42} />
                                                        </div>
                                                    )}
                                                </Link>

                                                {recipe.isFeatured ? (
                                                    <span className="ttdn-recipe-grid-card__featured">
                                                        <Sparkles size={12} className="me-1" />
                                                        {copy.featured}
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="ttdn-recipe-grid-card__body">
                                                <div className="ttdn-recipe-grid-card__meta">
                                                    <span>
                                                        <Clock3 size={14} />
                                                        <span>{totalTime} {copy.minutes}</span>
                                                    </span>
                                                    <span>
                                                        <ChefHat size={14} />
                                                        <span>{recipe.servings} {copy.servings}</span>
                                                    </span>
                                                </div>

                                                <Link
                                                    to={`/recipes/${recipe.slug}`}
                                                    className="ttdn-recipe-grid-card__title-link"
                                                >
                                                    <h3 className="ttdn-recipe-grid-card__title">{recipe.name}</h3>
                                                </Link>

                                                <p className="text-content mb-3 ttdn-recipe-grid-card__description">
                                                    {recipe.description || copy.noDescription}
                                                </p>

                                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 ttdn-recipe-grid-card__footer">
                                                    <span
                                                        className={`badge rounded-pill px-3 py-2 ${
                                                            difficultyClassNames[normalizedDifficulty] || 'bg-light text-muted'
                                                        }`}
                                                    >
                                                        {recipe.difficulty}
                                                    </span>

                                                    <div className="d-flex flex-wrap gap-2">
                                                        {recipe.tags?.slice(0, 2).map((tag) => (
                                                            <span key={tag} className="badge bg-light text-muted rounded-pill px-3 py-2">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {totalPages > 1 && !loading ? (
                        <div className="d-flex justify-content-center flex-wrap gap-2 mt-5">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`btn rounded-pill px-3 ${page === index + 1 ? 'theme-bg-color text-white' : 'btn-light text-dark'}`}
                                    onClick={() => setPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>
        </>
    );
}
