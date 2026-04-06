import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuth } from '../context/AuthContext';
import { Car as CarIcon, ChevronRight, Box, Ruler } from 'lucide-react';
import { CARS_DATA } from '../data/staticData';
import { useEffect } from 'react';

export default function CarSelection() {
    const { theme, isDark } = useTheme();
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Redirect to sign in if not authenticated
    useEffect(() => {
        if (!loading && !user) navigate('/signin');
    }, [user, loading, navigate]);

    const handleCarSelect = (car: typeof CARS_DATA[0]) => {
        navigate('/dashboard', { state: { car: car.name } });
    };

    const styles = getStyles(theme, isDark, isMobile);

    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.mainContent}>
                <div style={styles.headerSection}>
                    <h1 style={styles.title}>Select your vehicle</h1>
                    <p style={styles.subtitle}>Choose a vehicle to start optimizing your trunk space</p>
                </div>

                <div style={styles.grid}>
                    {CARS_DATA.map((car, index) => (
                        <div
                            key={index}
                            id={`car-card-${index}`}
                            style={styles.card}
                            onClick={() => handleCarSelect(car)}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = theme.shadowMd ?? '0 8px 32px rgba(0,0,0,0.4)';
                                e.currentTarget.style.borderColor = theme.accent;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = theme.border;
                            }}
                        >
                            <div style={styles.iconWrapper}>
                                <CarIcon size={32} color={theme.accent} strokeWidth={1.5} />
                            </div>
                            <div style={styles.cardContent}>
                                <h3 style={styles.carName}>{car.name}</h3>
                                <p style={styles.carDesc}>{car.description}</p>
                                <div style={styles.statsRow}>
                                    <div style={styles.stat}>
                                        <Box size={14} color={theme.textSecondary} />
                                        <span>{car.volume}</span>
                                    </div>
                                    <div style={styles.statDivider} />
                                    <div style={styles.stat}>
                                        <Ruler size={14} color={theme.textSecondary} />
                                        <span>{car.dimensions}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={styles.arrow}>
                                <ChevronRight size={20} color={theme.textSecondary} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const getStyles = (theme: any, isDark: boolean, isMobile: boolean): Record<string, React.CSSProperties> => ({
    container: { minHeight: '100vh', background: isDark ? '#000' : theme.bg, fontFamily: "'Google Sans','Roboto','Inter',sans-serif", display: 'flex', flexDirection: 'column' },
    mainContent: { flex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto', padding: isMobile ? '40px 20px' : '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    headerSection: { textAlign: 'center', marginBottom: isMobile ? '40px' : '60px', maxWidth: '600px' },
    title: { fontSize: isMobile ? '32px' : '44px', fontWeight: '400', color: theme.text, marginBottom: '16px', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '16px', color: theme.textSecondary, lineHeight: '1.5', fontWeight: '400' },
    grid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', width: '100%' },
    card: { background: isDark ? '#1a1a1c' : '#fff', border: `1px solid ${theme.border}`, borderRadius: '24px', padding: isMobile ? '24px' : '32px', display: 'flex', alignItems: 'flex-start', gap: isMobile ? '16px' : '24px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', position: 'relative' },
    iconWrapper: { width: isMobile ? '56px' : '64px', height: isMobile ? '56px' : '64px', borderRadius: '50%', background: isDark ? 'rgba(138,180,248,0.1)' : '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    cardContent: { flex: 1 },
    carName: { fontSize: '20px', fontWeight: '500', color: theme.text, margin: '0 0 4px 0' },
    carDesc: { fontSize: '14px', color: theme.textSecondary, marginBottom: '16px', lineHeight: '1.4' },
    statsRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
    stat: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: theme.textSecondary, background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa', padding: '6px 12px', borderRadius: '100px' },
    statDivider: { width: '4px', height: '4px', borderRadius: '50%', background: theme.border },
    arrow: { display: isMobile ? 'none' : 'flex', alignItems: 'center', paddingTop: '4px' },
});
