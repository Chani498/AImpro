import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout';
import { ProtectedRoute, PublicRoute } from '@/components/auth';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'assets',
        element: (
          <div className="page-header">
            <h1 className="page-title">Asset Management</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'assets/new',
        element: (
          <div className="page-header">
            <h1 className="page-title">Add Asset</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'tickets',
        element: (
          <div className="page-header">
            <h1 className="page-title">Ticket Management</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'tickets/new',
        element: (
          <div className="page-header">
            <h1 className="page-title">Create Ticket</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'reports',
        element: (
          <div className="page-header">
            <h1 className="page-title">Reports</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'users',
        element: (
          <div className="page-header">
            <h1 className="page-title">User Management</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'users/new',
        element: (
          <div className="page-header">
            <h1 className="page-title">Add User</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'settings',
        element: (
          <div className="page-header">
            <h1 className="page-title">Settings</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'settings/company',
        element: (
          <div className="page-header">
            <h1 className="page-title">Company Settings</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'profile',
        element: (
          <div className="page-header">
            <h1 className="page-title">Profile</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'help',
        element: (
          <div className="page-header">
            <h1 className="page-title">Help & Support</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
      {
        path: 'activity',
        element: (
          <div className="page-header">
            <h1 className="page-title">Activity Log</h1>
            <p className="page-description">Coming soon</p>
          </div>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
