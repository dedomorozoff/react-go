import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../stores/auth'
import { LogIn, User, Lock, AlertCircle } from 'lucide-react'
import styles from './LoginView.module.css'

export default function LoginView() {
    const auth = useAuthStore()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!username || !password) {
            setError('Please fill in all fields')
            return
        }

        const success = await auth.login(username, password)
        if (success) {
            navigate('/admin')
        } else {
            setError(auth.error)
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={`${styles.loginCard} glass-card`}>
                <div className={styles.loginHeader}>
                    <div className={styles.logoCircle}>
                        <Lock size={32} color="white" />
                    </div>
                    <h2>Admin Login</h2>
                    <p>Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className={styles.loginForm}>
                    {error && (
                        <div className={styles.errorMsg}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="admin"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary btn-block" disabled={auth.loading}>
                        {!auth.loading && <LogIn size={20} />}
                        <span>{auth.loading ? 'Logging in...' : 'Sign In'}</span>
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    <Link to="/" className={styles.backLink}>Back to landing page</Link>
                </div>
            </div>
        </div>
    )
}
