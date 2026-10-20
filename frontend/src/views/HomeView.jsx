import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, Layers, Activity } from 'lucide-react'
import client from '../api/client'
import styles from './HomeView.module.css'

export default function HomeView() {
    const [counts, setCounts] = useState({ total: 0, active: 0, completed: 0, pending: 0 })
    const [backendStatus, setBackendStatus] = useState('Checking...')

    const stats = [
        { label: 'Total Projects', value: String(counts.total), Icon: Layers, color: '#6366f1' },
        { label: 'Active Tasks', value: String(counts.active), Icon: Activity, color: '#f59e0b' },
        { label: 'Completed', value: String(counts.completed), Icon: CheckCircle2, color: '#10b981' },
        { label: 'Pending', value: String(counts.pending), Icon: Clock, color: '#64748b' },
    ]

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const res = await client.get('/api/health')
                if (mounted) {
                    setBackendStatus(res.data.message || res.data.status)
                }
            } catch (e) {
                if (mounted) {
                    setBackendStatus('Offline')
                }
            }
            try {
                const res = await client.get('/api/dashboard/stats')
                if (mounted) {
                    setCounts(res.data)
                }
            } catch (e) {
                console.error('Failed to load stats')
            }
        })()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <div className={styles.dashboard}>
            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={`${styles.statCard} glass-card`}>
                        <div
                            className={styles.statIcon}
                            style={{ backgroundColor: stat.color + '20', color: stat.color }}
                        >
                            <stat.Icon size={24} />
                        </div>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>{stat.label}</p>
                            <p className={styles.statValue}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`${styles.statusCard} glass-card`}>
                <h3>System Status</h3>
                <div className={styles.statusIndicator}>
                    <div
                        className={`${styles.pulse} ${backendStatus.includes('alive') ? styles.pulseGreen : ''}`}
                    ></div>
                    <span>Backend API: {backendStatus}</span>
                </div>
            </div>
        </div>
    )
}
