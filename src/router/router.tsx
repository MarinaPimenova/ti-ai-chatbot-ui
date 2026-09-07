// router.tsx
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ROUTE } from './router.enum';
import { ErrorPage } from '../error';
import { BaseNetworkError } from '../error/network';
import { LandingLayout } from '../landing/landing-layout';
import { ReLogin } from '../error/relogin';

import { isNull } from '../services/utils.service';
import { ErrorBoundary } from 'react-error-boundary';
import Fallback from '../error/fallback';
import type { ErrorInfo } from 'react';

// Guard component for protected routes
const ProtectedRoute = () => {

    return <Outlet />;
};

export const Routes = () => {
    const router = createBrowserRouter(
        [
            {
                path: ROUTE.ROOT,
                element: <LandingLayout />,
                errorElement: <ErrorPage />,
                children: [
                    { index: true, element: <Dashboard /> },
                    {
                        element: <ProtectedRoute />,
                        children: [

                        ],
                    },
                ],
            },
            {
                path: ROUTE.RE_LOGIN,
                errorElement: <ErrorPage />,
                children: [{ index: true, element: <ReLogin /> }],
            },
            {
                path: ROUTE.ERROR,
                errorElement: <ErrorPage />,
                children: [
                    { index: true, element: <BaseNetworkError /> },
                    { path: ROUTE.ERROR_CODE, element: <BaseNetworkError /> },
                ],
            },
        ],
        {
            basename: '/dashboard-page',
            future: {
                v7_relativeSplatPath: true,
                v7_startTransition: true, // Moved here from <RouterProvider />
            },
        }
    );

    return (
        <ErrorBoundary
            FallbackComponent={Fallback}
            onReset={() => {}}
            onError={logErrorToService}
        >
            <RouterProvider router={router} />
        </ErrorBoundary>
    );
};

// Updated 'error' type from Error to unknown
function logErrorToService(error: unknown, info: ErrorInfo) {
    console.error('Caught an error:', error, info);
}