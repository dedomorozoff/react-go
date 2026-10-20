import { Link } from 'react-router'
import styles from './NotFoundView.module.css'

export default function NotFoundView() {
    return (
        <div className={styles.notFound}>
            <div className={`glass-card ${styles.card}`}>
                <h1>404</h1>
                <p>Page not found</p>
                <Link to="/" className={`${styles.link} btn-primary`}>Back home</Link>
            </div>
        </div>
    )
}
