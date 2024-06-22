import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';
import ProtectedRoute from 'src/auth/roles/protected_route';

// Lazy load the pages
const IndexPage = lazy(() => import('src/pages/dashboard/scholarships_index'));
const MyScholarships = lazy(() => import('src/pages/dashboard/my_scholarships_index'));
const PageThree = lazy(() => import('src/pages/dashboard/three'));
const PageFour = lazy(() => import('src/pages/dashboard/ranking'));
const CreateScholarship = lazy(() => import('src/pages/dashboard/create_scholarship_index'));
const PageSix = lazy(() => import('src/pages/dashboard/six'));

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <ProtectedRoute element={<IndexPage />} permission="Scholarships" />, index: true },
      { path: 'applications', element: <ProtectedRoute element={<MyScholarships />} permission="MyScholarships" /> },
      {
        path: 'group',
        children: [
          { element: <ProtectedRoute element={<PageFour />} permission="Scholarships" />, index: true },
          { path: 'create', element: <ProtectedRoute element={<CreateScholarship />} permission="Scholarships" /> },
        ],
      },
    ],
  },
];
