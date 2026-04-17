import type { ReactNode } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { ROUTE_PATHS } from '@/constant/routePaths';
import { AdminLayout, StorefrontLayout } from '@/layouts';
import { AdminRoute } from '@/routes/guards/AdminRoute';
import { ProtectedRoute } from '@/routes/guards/ProtectedRoute';
import {
    AdminDashboardPage,
    AdminOrderDetailPage,
    AdminOrdersPage,
    AdminProductFormPage,
    AdminProductsPage,
    AdminRecipeFormPage,
    AdminRecipesPage,
    AdminUsersPage,
    AdminVouchersPage,
    CartPage,
    CheckoutPage,
    LoginPage,
    NotFoundPage,
    OrderDetailPage,
    OrderListPage,
    PaymentPage,
    ProductDetailPage,
    ProductListPage,
    ProfilePage,
    RecipeDetailPage,
    RecipesPage,
    RegisterPage,
    StorefrontHomePage,
} from '@/pages';

function StorefrontProtectedOutlet() {
    return (
        <ProtectedRoute>
            <Outlet />
        </ProtectedRoute>
    );
}

function renderAdminPage(element: ReactNode) {
    return (
        <AdminRoute>
            <AdminLayout>{element}</AdminLayout>
        </AdminRoute>
    );
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<StorefrontLayout />}>
                <Route path={ROUTE_PATHS.home} element={<StorefrontHomePage />} />
                <Route path={ROUTE_PATHS.products} element={<ProductListPage />} />
                <Route path={ROUTE_PATHS.productDetail} element={<ProductDetailPage />} />
                <Route path={ROUTE_PATHS.recipes} element={<RecipesPage />} />
                <Route path={ROUTE_PATHS.recipeDetail} element={<RecipeDetailPage />} />
                <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
                <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />

                <Route element={<StorefrontProtectedOutlet />}>
                    <Route path={ROUTE_PATHS.cart} element={<CartPage />} />
                    <Route path={ROUTE_PATHS.checkout} element={<CheckoutPage />} />
                    <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
                    <Route path={ROUTE_PATHS.payment} element={<PaymentPage />} />
                    <Route path={ROUTE_PATHS.orders} element={<OrderListPage />} />
                    <Route path={ROUTE_PATHS.orderDetail} element={<OrderDetailPage />} />
                </Route>
            </Route>

            <Route
                path={ROUTE_PATHS.admin}
                element={renderAdminPage(<AdminDashboardPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminProducts}
                element={renderAdminPage(<AdminProductsPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminProductCreate}
                element={renderAdminPage(<AdminProductFormPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminProductEdit}
                element={renderAdminPage(<AdminProductFormPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminRecipes}
                element={renderAdminPage(<AdminRecipesPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminRecipeCreate}
                element={renderAdminPage(<AdminRecipeFormPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminRecipeEdit}
                element={renderAdminPage(<AdminRecipeFormPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminVouchers}
                element={renderAdminPage(<AdminVouchersPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminOrders}
                element={renderAdminPage(<AdminOrdersPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminOrderDetail}
                element={renderAdminPage(<AdminOrderDetailPage />)}
            />
            <Route
                path={ROUTE_PATHS.adminUsers}
                element={renderAdminPage(<AdminUsersPage />)}
            />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
