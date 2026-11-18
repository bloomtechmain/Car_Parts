import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/public/HomePage';
import FindPartsPage from '../pages/public/FindPartsPage';
import AboutUsPage from '../pages/public/AboutUsPage';
import FAQPage from '../pages/public/FAQPage';
import ContactUsPage from '../pages/public/ContactUsPage';
import SelectOptionPage from '../pages/public/SelectOptionPage';
import LoginPage from '../pages/dashboard/LoginPage';
import SupplierDashboard from '../pages/dashboard/SupplierDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import CustomerDashboard from '../pages/dashboard/CustomerDashboard';
import RegisterPage from '../pages/dashboard/RegisterPage';
import SupplierRegisterPage from '../pages/dashboard/SupplierRegisterPage';
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from '../components/layout/PublicLayout';

export const router = createBrowserRouter(
  [
    {
      element: <PublicLayout />,
      children: [
        { path: '/', element: <HomePage /> },
        { path: '/find-parts', element: <FindPartsPage /> },
        { path: '/about', element: <AboutUsPage /> },
        { path: '/faq', element: <FAQPage /> },
        { path: '/contact', element: <ContactUsPage /> },
      ],
    },
    { path: '/select-option', element: <SelectOptionPage /> },
    { path: '/dashboard/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/supplier/register', element: <SupplierRegisterPage /> },
    {
      path: '/dashboard/customer',
      element: (
        <ProtectedRoute role="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/customer/account',
      element: (
        <ProtectedRoute role="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/supplier',
      element: (
        <ProtectedRoute role="supplier">
          <SupplierDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/admin',
      element: (
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/admin/suppliers',
      element: (
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/admin/supplier-requests',
      element: (
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/admin/customers',
      element: (
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/dashboard/supplier/replies',
      element: (
        <ProtectedRoute role="supplier">
          <SupplierDashboard />
        </ProtectedRoute>
      ),
    },
  ],
);
