import { Outlet } from 'react-router-dom';
import { StorefrontFooter } from '@/features/storefront/components/StorefrontFooter';
import { StorefrontHeader } from '@/features/storefront/components/StorefrontHeader';

export function StorefrontLayout() {
    return (
        <div className="storefront-app bg-effect">
            <StorefrontHeader />
            <main className="storefront-main">
                <Outlet />
            </main>
            <StorefrontFooter />
        </div>
    );
}
