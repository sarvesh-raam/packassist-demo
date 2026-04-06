import { useTheme } from '../context/ThemeContext';

interface LoadingAnimationProps {
    totalBags: number;
    realTimeCount: number;
    realTimeMessage?: string;
}

export default function LoadingAnimation({ totalBags, realTimeCount, realTimeMessage }: LoadingAnimationProps) {
    const { theme, isDark } = useTheme();
    const styles = getStyles(theme, isDark);

    // Calculate display percentage
    // We aim for 95% while placing bags, leaving the last 5% for finalizing
    const placementProgress = totalBags > 0 ? (realTimeCount / totalBags) * 95 : 0;
    const isFinalizing = realTimeCount === totalBags && totalBags > 0;

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.dotsContainer}>
                    <div style={{ ...styles.dot, animationDelay: '0s' }} />
                    <div style={{ ...styles.dot, animationDelay: '0.2s' }} />
                    <div style={{ ...styles.dot, animationDelay: '0.4s' }} />
                </div>

                <h2 style={styles.title}>Optimizing Arrangement</h2>
                <p style={styles.subtitle}>
                    {realTimeMessage || 'AI is calculating the perfect fit for your trunk...'}
                </p>

                <div style={styles.progressContainer}>
                    <div style={styles.progressText}>
                        {isFinalizing ? (
                            <span style={{ color: theme.accent }}>Finalizing 3D Models...</span>
                        ) : (
                            <>Bags Placed: <span style={styles.count}>{realTimeCount} / {totalBags}</span></>
                        )}
                    </div>
                    <div style={styles.progressBarBg}>
                        <div
                            style={{
                                ...styles.progressBarFill,
                                width: isFinalizing ? '100%' : `${placementProgress}%`,
                                transition: isFinalizing ? 'width 2s ease-out' : 'width 0.4s ease-out'
                            }}
                        />
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-10px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

const getStyles = (theme: any, _isDark: boolean): Record<string, React.CSSProperties> => ({
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: _isDark ? '#000000' : theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        fontFamily: "'Google Sans', 'Roboto', 'Inter', sans-serif",
    },
    content: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '450px',
        width: '90%',
    },
    dotsContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
    },
    dot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: theme.accent,
        animation: 'bounce 1.4s infinite ease-in-out',
    },
    title: {
        fontSize: '24px',
        fontWeight: '400',
        color: theme.text,
        margin: '0 0 12px 0',
    },
    subtitle: {
        fontSize: '15px',
        color: theme.textSecondary,
        marginBottom: '40px',
        minHeight: '1.5em',
        lineHeight: '1.4',
    },
    progressContainer: {
        width: '100%',
        marginTop: '24px',
    },
    progressText: {
        fontSize: '16px',
        color: theme.text,
        marginBottom: '12px',
        fontWeight: '500',
    },
    count: {
        color: theme.accent,
        fontSize: '18px',
        fontWeight: '600',
        marginLeft: '4px',
    },
    progressBarBg: {
        width: '100%',
        height: '6px',
        background: _isDark ? 'rgba(255,255,255,0.05)' : '#f1f3f4',
        borderRadius: '100px',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        background: theme.accent,
        borderRadius: '100px',
    },
});
