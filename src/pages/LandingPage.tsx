import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { Target, Box, Zap } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function LandingPage() {
    const navigate = useNavigate();
    const { theme, isDark } = useTheme();
    const isMobile = useIsMobile();

    const features = [
        {
            icon: <Target size={32} color={theme.accent} />,
            title: 'Smart Optimization',
            description: 'AI-powered algorithm finds the perfect arrangement for your luggage',
        },
        {
            icon: <Box size={32} color={theme.accent} />,
            title: '3D Visualization',
            description: 'See exactly how your bags fit with interactive 3D preview',
        },
        {
            icon: <Zap size={32} color={theme.accent} />,
            title: 'Instant Results',
            description: 'Get your optimized packing plan in seconds',
        },
    ];

    const styles = getStyles(theme, isDark, isMobile);

    return (
        <div style={styles.container}>
            <Header />

            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Optimize your trunk space
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Smart packing solution for your vehicle. Powered by AI.
                    </p>
                    <div style={styles.ctaContainer}>
                        <button style={styles.primaryButton} onClick={() => navigate('/signup')}>
                            Get started
                        </button>
                        <button style={styles.secondaryButton} onClick={() => navigate('/signin')}>
                            Sign in
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.features}>
                <div style={styles.featuresContent}>
                    <div style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <div key={index} style={styles.featureCard}>
                                <div style={styles.featureIcon}>{feature.icon}</div>
                                <h3 style={styles.featureTitle}>{feature.title}</h3>
                                <p style={styles.featureDescription}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section style={styles.howItWorks}>
                <div style={styles.howItWorksContent}>
                    <h2 style={styles.sectionTitle}>How it works</h2>
                    <div style={styles.stepsContainer}>
                        <div style={styles.step}>
                            <div style={styles.stepNumber}>1</div>
                            <p style={styles.stepText}>Add your bags</p>
                        </div>
                        <div style={styles.stepArrow}>→</div>
                        <div style={styles.step}>
                            <div style={styles.stepNumber}>2</div>
                            <p style={styles.stepText}>AI optimizes</p>
                        </div>
                        <div style={styles.stepArrow}>→</div>
                        <div style={styles.step}>
                            <div style={styles.stepNumber}>3</div>
                            <p style={styles.stepText}>View 3D result</p>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}

const getStyles = (theme: any, isDark: boolean, isMobile: boolean): Record<string, React.CSSProperties> => ({
    container: {
        minHeight: '100vh',
        background: isDark ? '#000000' : theme.bg,
        transition: 'background-color 0.3s ease',
    },
    hero: {
        padding: isMobile ? '80px 20px 40px' : '120px 24px 80px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
    },
    heroContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
    },
    heroTitle: {
        fontSize: isMobile ? '36px' : '56px',
        fontWeight: '400',
        color: theme.text,
        margin: 0,
        lineHeight: '1.2',
        letterSpacing: '-0.5px',
    },
    heroSubtitle: {
        fontSize: '20px',
        color: theme.textSecondary,
        margin: 0,
        fontWeight: '400',
        lineHeight: '1.5',
    },
    ctaContainer: {
        display: 'flex',
        gap: '16px',
        marginTop: '16px',
    },
    primaryButton: {
        background: theme.accent,
        color: isDark ? '#202124' : '#fff',
        border: 'none',
        borderRadius: '24px',
        padding: '12px 32px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: theme.shadow,
    },
    secondaryButton: {
        background: 'transparent',
        color: theme.accent,
        border: `1px solid ${theme.border}`,
        borderRadius: '24px',
        padding: '12px 32px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    features: {
        padding: '80px 24px',
        background: isDark ? '#000000' : theme.bgSecondary,
    },
    featuresContent: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
    },
    featureCard: {
        background: theme.cardBg,
        borderRadius: '8px',
        padding: '40px 32px',
        textAlign: 'center',
        border: `1px solid ${theme.borderLight}`,
        transition: 'box-shadow 0.2s, background-color 0.3s',
    },
    featureIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    featureTitle: {
        fontSize: '18px',
        fontWeight: '500',
        color: theme.text,
        margin: '0 0 12px 0',
    },
    featureDescription: {
        fontSize: '14px',
        color: theme.textSecondary,
        lineHeight: '1.6',
        margin: 0,
    },
    howItWorks: {
        padding: '80px 24px',
        background: theme.bg,
    },
    howItWorksContent: {
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: '32px',
        fontWeight: '400',
        color: theme.text,
        marginBottom: '48px',
    },
    stepsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? '12px' : '24px',
        flexWrap: 'nowrap',
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
    },
    stepNumber: {
        width: isMobile ? '36px' : '48px',
        height: isMobile ? '36px' : '48px',
        borderRadius: '50%',
        background: theme.accentLight,
        color: theme.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isMobile ? '14px' : '18px',
        fontWeight: '500',
    },
    stepText: {
        fontSize: '14px',
        color: theme.textSecondary,
        margin: 0,
    },
    stepArrow: {
        fontSize: isMobile ? '16px' : '24px',
        color: theme.border,
        fontWeight: '300',
    },
    footer: {
        padding: '24px',
        borderTop: `1px solid ${theme.borderLight}`,
        background: theme.bgSecondary,
    },
    footerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: '12px',
        color: theme.textSecondary,
        margin: 0,
    },
    footerLinks: {
        display: 'flex',
        gap: '24px',
    },
    footerLink: {
        fontSize: '12px',
        color: theme.textSecondary,
        textDecoration: 'none',
    },
});
