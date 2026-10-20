import { NavLink, Outlet, matchRoutes, useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../stores/auth'
import { routeTree } from '../router'
import { Activity, FolderKanban, Home, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
    const auth = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    // Same as $route.meta.title in the Vue version: subtitle from the deepest matched route.
    const matches = matchRoutes(routeTree, location)
    const title = matches?.at(-1)?.route?.meta?.title ?? 'Admin'

    const handleLogout = () => {
        auth.logout()
        navigate('/login')
    }

    const navClass = ({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`

    return (
        <div className={styles.appContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Activity className={styles.iconBrand} size={22} />
                    <span>ReactGo Admin</span>
                </div>

                <nav className={styles.navMenu}>
                    <NavLink to="/admin" className={navClass} end>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/projects" className={navClass}>
                        <FolderKanban size={20} />
                        <span>Projects</span>
                    </NavLink>
                </nav>

                <div className={styles.sidebarFooter}>
                    <NavLink to="/" className={navClass}>
                        <Home size={20} />
                        <span>Back to Site</span>
                    </NavLink>
                    <div className={styles.navItem}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${styles.logout}`}
                        onClick={handleLogout}
                        role="button"
                        tabIndex={0}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <h1>{title}</h1>
                    <div className={styles.userProfile}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{auth.user?.username}</span>
                            <span className={styles.userRole}>Administrator</span>
                        </div>
                        <div className={styles.avatar}>
                            {auth.user?.username?.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className={styles.pageContainer}>
                    {/* Keyed wrapper reproduces the <transition name="fade" mode="out-in"> */}
                    <div key={location.pathname} className={styles.fadePage}>
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
