import { Link } from 'react-router'
import { useAuthStore } from '../stores/auth'
import { Shield, Zap, Sparkles, Code, ArrowRight, LayoutDashboard } from 'lucide-react'
import styles from './LandingView.module.css'

export default function LandingView() {
    const authenticated = useAuthStore((s) => !!s.token)

    return (
        <div className={styles.landing}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        <Zap className={styles.iconBrand} />
                        <span>React-Go</span>
                    </div>
                    <div className={styles.navLinks}>
                        <a href="#features">Features</a>
                        <a href="#stack">Stack</a>
                        <Link to="/admin" className="btn-primary">Go to Admin</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.gradientText}>Build Fast. Ship Faster.</h1>
                        <p className={styles.heroSubtitle}>
                            The ultimate starter kit combining the power of Go with the elegance
                            of React 19. Everything you need for your next big idea, already
                            integrated and ready to go.
                        </p>
                        <div className={styles.heroActions}>
                            <Link to="/admin" className="btn-primary btn-lg">
                                Get Started
                                <ArrowRight size={20} />
                            </Link>
                            <a
                                href="https://github.com/dedomorozoff/react-go"
                                className={`${styles.btnSecondary} btn-lg`}
                            >
                                View Source
                            </a>
                        </div>
                    </div>
                    <div className={styles.heroVisual}>
                        <div className={`glass-card ${styles.codeCard}`}>
                            <div className={styles.codeHeader}>
                                <div className={styles.dotRed}></div>
                                <div className={styles.dotYellow}></div>
                                <div className={styles.dotGreen}></div>
                            </div>
                            <pre><code><span className={styles.keyword}>func</span> <span className={styles.func}>main</span>() {'{'}
  <span className={styles.comment}>{'// Pure speed'}</span>
  server := go.NewServer()
  server.Run(<span className={styles.string}>":8080"</span>)
{'}'}</code></pre>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.badge}>Features</span>
                        <h2>Everything in one place</h2>
                    </div>
                    <div className={styles.featuresGrid}>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Shield className={styles.featureIcon} color="#6366f1" />
                            <h3>Secure by default</h3>
                            <p>Built-in security best practices from Go and industry standards.</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Sparkles className={styles.featureIcon} color="#f59e0b" />
                            <h3>Modern UI</h3>
                            <p>Clean, responsive and premium design with React 19 and CSS variables.</p>
                        </div>
                        <div className={`glass-card ${styles.featureCard}`}>
                            <Zap className={styles.featureIcon} color="#10b981" />
                            <h3>High Performance</h3>
                            <p>Go backend ensures sub-millisecond responses for your API.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stack Section */}
            <section id="stack" className={styles.stack}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.badge}>Technology Stack</span>
                        <h2>Modern &amp; Robust Tools</h2>
                    </div>
                    <div className={styles.stackGrid}>
                        <div className={styles.stackItem}>
                            <div className={`glass-card ${styles.stackBox}`}>
                                <img
                                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg"
                                    alt="Go"
                                    width="60"
                                />
                            </div>
                            <h4>Go Backend</h4>
                            <p>Go 1.25, chi Router, GORM, SQLite</p>
                        </div>
                        <div className={styles.stackItem}>
                            <div className={`glass-card ${styles.stackBox}`}>
                                <img
                                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg"
                                    alt="React"
                                    width="60"
                                />
                            </div>
                            <h4>React Frontend</h4>
                            <p>React 19, Vite, zustand, React Router</p>
                        </div>
                        <div className={styles.stackItem}>
                            <div className={`glass-card ${styles.stackBox}`}>
                                <div className={styles.customStackIcon}>
                                    <Code size={40} color="#64748b" />
                                </div>
                            </div>
                            <h4>Ecosystem</h4>
                            <p>JWT Auth, Lucide Icons, Axios, Makefile</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.container}>
                    <p>&copy; 2026 React-Go Project.</p>
                </div>
            </footer>

            {/* Floating Action Button */}
            {authenticated && (
                <Link to="/admin" className={`glass-card ${styles.fab}`} title="Back to Admin">
                    <LayoutDashboard size={24} />
                    <span className={styles.fabText}>Dashboard</span>
                </Link>
            )}
        </div>
    )
}
