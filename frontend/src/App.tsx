import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { MainLayout } from './layouts/MainLayout';
import { FullScreenLayout } from './layouts/FullScreenLayout';

// Lazy load pages for code splitting
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const ProgressPage = lazy(() =>
  import('./pages/ProgressPage').then((module) => ({ default: module.ProgressPage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
);
const LandmarkDetailPage = lazy(() =>
  import('./pages/LandmarkDetailPage').then((module) => ({ default: module.LandmarkDetailPage })),
);
const AdminLandmarkList = lazy(() =>
  import('./pages/admin/AdminLandmarkList').then((module) => ({
    default: module.AdminLandmarkList,
  })),
);
const AdminLandmarkForm = lazy(() =>
  import('./pages/admin/AdminLandmarkForm').then((module) => ({
    default: module.AdminLandmarkForm,
  })),
);
const AdminCommentModeration = lazy(() =>
  import('./pages/admin/AdminCommentModeration').then((module) => ({
    default: module.AdminCommentModeration,
  })),
);
const MapPage = lazy(() =>
  import('./components/MapPage/MapPage').then((module) => ({ default: module.MapPage })),
);

// Loading fallback component
function PageLoader() {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Global 401 error handling - redirect to login
queryClient.getQueryCache().subscribe({
  next: (event) => {
    if (event.state.error && (event.state.error as any).status === 401) {
      window.location.href = '/login';
    }
  },
});

queryClient.getMutationCache().subscribe({
  next: (event) => {
    if (event.state.error && (event.state.error as any).status === 401) {
      window.location.href = '/login';
    }
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Main layout routes */}
            <Route path="/" element={<MainLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route
                path="register"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RegisterPage />
                  </Suspense>
                }
              />
              <Route
                path="landmarks/:id"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LandmarkDetailPage />
                  </Suspense>
                }
              />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="profile"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProfilePage />
                    </Suspense>
                  }
                />
                <Route
                  path="progress"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <ProgressPage />
                    </Suspense>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <SettingsPage />
                    </Suspense>
                  }
                />
              </Route>

              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route
                  path="admin/landmarks"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLandmarkList />
                    </Suspense>
                  }
                />
                <Route
                  path="admin/landmarks/new"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLandmarkForm />
                    </Suspense>
                  }
                />
                <Route
                  path="admin/landmarks/:id/edit"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLandmarkForm />
                    </Suspense>
                  }
                />
                <Route
                  path="admin/comments"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminCommentModeration />
                    </Suspense>
                  }
                />
              </Route>

              {/* 404 catch-all for main layout */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Full-screen layout routes */}
            <Route path="/map" element={<FullScreenLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <MapPage />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
