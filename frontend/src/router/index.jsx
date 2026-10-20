import { lazy } from 'react'

// Route config mirrors the original vue-router setup: lazy chunks,
// auth guard via `meta.requiresAuth`, guest redirect on /login and
// per-route `meta.title` used for the document title.

const AdminLayout = lazy(() => import('../layouts/AdminLayout'))
const LandingView = lazy(() => import('../views/LandingView'))
const LoginView = lazy(() => import('../views/LoginView'))
const HomeView = lazy(() => import('../views/HomeView'))
const ProjectsView = lazy(() => import('../views/ProjectsView'))
const NotFoundView = lazy(() => import('../views/NotFoundView'))

export const routeTree = [
    {
        path: '/',
        name: 'landing',
        element: <LandingView />,
        meta: { title: 'React-Go Starter' },
    },
    {
        path: '/login',
        name: 'login',
        element: <LoginView />,
        meta: { title: 'Login' },
    },
    {
        path: '/admin',
        name: 'admin',
        element: <AdminLayout />,
        meta: { requiresAuth: true },
        children: [
            {
                index: true,
                name: 'home',
                element: <HomeView />,
                meta: { title: 'Dashboard' },
            },
            {
                path: 'projects',
                name: 'projects',
                element: <ProjectsView />,
                meta: { title: 'Project Management' },
            },
        ],
    },
    {
        path: '*',
        name: 'not-found',
        element: <NotFoundView />,
        meta: { title: 'Page Not Found' },
    },
]

// Helper for layouts/shells: resolves the matched route chain for a location.
export function matchRouteTree(location) {
    return matchRoutes(routeTree, location)
}
