import { Profiler, Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleRoute } from '@/components/RoleRoute';
import { env } from '@/config/env';
import { MainLayout } from '@/layouts/MainLayout';
import { trackEvent } from '@/lib/monitoring';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('@/pages/AdminProductsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const App = (): JSX.Element => {
  const content = (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner className="py-24" />}>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<ProductsPage />} path="/products" />
          <Route element={<ProductDetailPage />} path="/products/:id" />
          <Route element={<CartPage />} path="/cart" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<ProtectedRoute />}>
            <Route element={<CheckoutPage />} path="/checkout" />
            <Route element={<OrderHistoryPage />} path="/orders" />
            <Route element={<OrderDetailPage />} path="/orders/:id" />
            <Route element={<ProfilePage />} path="/profile" />
            <Route element={<RoleRoute />}>
              <Route element={<AdminDashboardPage />} path="/admin" />
              <Route element={<AdminProductsPage />} path="/admin/products" />
            </Route>
          </Route>
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </Suspense>
    </MainLayout>
  );

  if (!env.VITE_ENABLE_PROFILER) {
    return content;
  }

  return <Profiler id="app" onRender={(_, phase, actualDuration) => { trackEvent('render_profile', { phase, actualDuration }); }}>{content}</Profiler>;
};

export default App;
