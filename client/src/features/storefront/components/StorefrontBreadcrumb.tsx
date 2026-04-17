import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translate } from '@/features/shared/utils/displayPreferences';
import { useThemeStore } from '@/store/themeStore';

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface StorefrontBreadcrumbProps {
    title: string;
    items: BreadcrumbItem[];
    subtitle?: string;
}

export function StorefrontBreadcrumb({ title, items, subtitle }: StorefrontBreadcrumbProps) {
    const language = useThemeStore((state) => state.language);

    return (
        <section className="breadcrumb-section pt-0">
            <div className="container-fluid-lg">
                <div className="row">
                    <div className="col-12">
                        <div className="breadcrumb-contain">
                            <div className="ttdn-breadcrumb-copy">
                                <h2>{title}</h2>
                                {subtitle ? <p className="text-content mb-0 mt-1">{subtitle}</p> : null}
                            </div>

                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link
                                            to="/"
                                            aria-label={translate({ vi: 'Trang chủ', en: 'Home' }, language)}
                                        >
                                            <Home size={14} />
                                        </Link>
                                    </li>

                                    {items.map((item, index) => {
                                        const isLast = index === items.length - 1;

                                        return (
                                            <li
                                                key={`${item.label}-${index}`}
                                                className={`breadcrumb-item${isLast ? ' active' : ''}`}
                                                aria-current={isLast ? 'page' : undefined}
                                            >
                                                {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : item.label}
                                            </li>
                                        );
                                    })}
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
