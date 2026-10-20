import { Suspense, useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation, matchRoutes } from 'react-router'
import { routeTree } from './router'
import { useAuthStore } from './stores/auth'

// Equivalent of the old `router.beforeEach`: hydrates the user profile on
// reload (token present but user missing) and redirects unauthenticated
// visitors to /login.
function RequireAuth({ children }) {
    const location = useLocation()
    const token = useAuthStore((s) => s.token)
    const user = useAuthStore((s) => s.user)
    const fetchMe = useAuthStore((s) => s.fetchMe)

    const hydrating = useRef(false)
    useEffect(() => {
        if (token && !user && !hydrating.current) {
            hydrating.current = true
            fetchMe()
        }
    }, [token, user, fetchMe])

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    return children
}

// Equivalent of the `login → /admin` redirect rule for already-authed users.
function GuestOnly({ children }) {
    const token = useAuthStore((s) => s.token)
    if (token) {
        return <Navigate to="/admin" replace />
    }
    return children
}

// Equivalent of `router.afterEach`: document title from the deepest matched meta.
function DocumentTitle() {
    const location = useLocation()
    useEffect(() => {
        const matches = matchRoutes(routeTree, location)
        const title = matches?.at(-1)?.route?.meta?.title
        document.title = title ? `${title} — React-Go` : 'React-Go'
    }, [location])
    return null
}

function wrapRoute({ route }) {
    const meta = route.meta ?? {}
    if (meta.requiresAuth) return <RequireAuth>{route.element}</RequireAuth>
    if (meta.guestOnly) return <GuestOnly>{route.element}</GuestOnly>
    return route.element
}

function renderRoutes(list) {
    return list.map((route) => (
        <Route
            key={route.index ? 'index' : route.path}
            index={route.index}
            path={route.index ? undefined : route.path}
            element={wrapRoute({ route })}
        >
            {route.children ? renderRoutes(route.children) : null}
        </Route>
    ))
}

export default function App() {
    return (
        <>
            <Suspense>
                <Routes>{renderRoutes(routeTree)}</Routes>
            </Suspense>
            <DocumentTitle />
        </>
    )
}
