import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';

export default function SignIn() {
    const { theme, isDark } = useTheme();
    const { login, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [step, setStep] = useState<'email' | 'password'>('email');
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const handleNext = () => {
        if (step === 'email' && email.trim()) setStep('password');
    };

    const handleBack = () => setStep('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 'email') { handleNext(); return; }

        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/cars');
        } catch (err: any) {
            const code = err?.code || '';
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Try again later.');
            } else {
                setError('Sign in failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            navigate('/cars');
        } catch (err: any) {
            setError('Google sign in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const styles = getStyles(theme, isDark, isMobile);

    const renderInput = (id: string, type: string, label: string, value: string, onChange: (v: string) => void) => (
        <div style={styles.inputWrapper}>
            <input
                type={type}
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocusedField(id)}
                onBlur={() => setFocusedField(null)}
                style={{ ...styles.input, borderColor: focusedField === id ? theme.accent : theme.border }}
                required
                disabled={isLoading}
                autoComplete={type === 'password' ? 'current-password' : 'email'}
            />
            <label htmlFor={id} style={{
                ...styles.label,
                ...(focusedField === id || value ? styles.labelFloating : {}),
                color: focusedField === id ? theme.accent : theme.textSecondary
            }}>
                {label}
            </label>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Left branding panel */}
                <div style={styles.leftSection}>
                    <div style={styles.logoMark}>PA</div>
                    <h1 style={styles.title}>{step === 'email' ? 'Sign In' : 'Welcome back'}</h1>
                    <p style={styles.subtitle}>PackAssist · Trunk Optimization</p>

                    {step === 'password' && (
                        <div style={styles.userInfo} onClick={handleBack}>
                            <div style={styles.userAvatar}>
                                <svg style={styles.avatarIcon} viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            </div>
                            <span style={styles.userName}>{email}</span>
                            <svg style={styles.dropdownIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 10l5 5 5-5z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Right form panel */}
                <div style={styles.rightSection}>
                    {error && (
                        <div style={styles.errorBox}>
                            <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {step === 'email'
                            ? renderInput('email', 'email', 'Email address', email, setEmail)
                            : renderInput('password', 'password', 'Enter your password', password, setPassword)
                        }

                        <div style={styles.actions}>
                            <Link to="/signup" style={styles.createAccount}>Create account</Link>
                            <button
                                type="submit"
                                id="signin-next-btn"
                                style={{ ...styles.nextButton, opacity: isLoading ? 0.7 : 1 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Next'}
                            </button>
                        </div>
                    </form>

                    {step === 'email' && (
                        <>
                            <div style={styles.divider}>
                                <div style={styles.line}></div>
                                <span style={styles.orText}>or</span>
                                <div style={styles.line}></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                style={styles.googleButton}
                                disabled={isLoading}
                            >
                                <svg style={styles.googleIcon} viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const getStyles = (theme: any, isDark: boolean, isMobile: boolean): Record<string, React.CSSProperties> => ({
    container: { minHeight: '100vh', background: isDark ? '#000' : theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '24px', fontFamily: "'Google Sans','Roboto','Inter',sans-serif", transition: 'background-color 0.3s' },
    card: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', maxWidth: isMobile ? '400px' : '840px', background: theme.cardBg, borderRadius: '8px', padding: isMobile ? '32px 24px' : '48px 40px', gap: isMobile ? '32px' : '48px', border: isDark ? 'none' : `1px solid ${theme.border}`, boxShadow: theme.shadow, transition: 'background-color 0.3s', margin: isMobile ? '0 16px' : '0' },
    leftSection: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: isMobile ? '100%' : '280px' },
    logoMark: { width: '44px', height: '44px', borderRadius: '10px', background: theme.accent, color: isDark ? '#202124' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', marginBottom: '24px', letterSpacing: '1px' },
    title: { fontSize: isMobile ? '28px' : '36px', fontWeight: '400', color: isDark ? theme.accent : theme.text, margin: '0 0 6px 0', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '13px', color: theme.textSecondary, margin: '0 0 20px 0' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 4px 4px', background: isDark ? '#3c4043' : '#f1f3f4', borderRadius: '16px', cursor: 'pointer', width: 'fit-content', marginTop: '8px', border: isDark ? 'none' : `1px solid ${theme.border}` },
    userAvatar: { width: '24px', height: '24px', borderRadius: '50%', background: isDark ? '#5f6368' : '#e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    avatarIcon: { width: '16px', height: '16px', color: theme.textSecondary },
    userName: { fontSize: '13px', color: theme.text, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    dropdownIcon: { width: '18px', height: '18px', color: theme.textSecondary },
    rightSection: { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: isMobile ? '100%' : '300px' },
    errorBox: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: theme.errorBg, border: isDark ? `1px solid ${theme.error}` : 'none', borderRadius: '4px', marginBottom: '24px', color: theme.error, fontSize: '14px' },
    errorIcon: { width: '20px', height: '20px', flexShrink: 0 },
    form: { display: 'flex', flexDirection: 'column' },
    inputWrapper: { position: 'relative', marginBottom: '8px' },
    input: { width: '100%', height: '56px', padding: '16px', paddingTop: '24px', fontSize: '16px', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px', outline: 'none', background: theme.inputBg, boxSizing: 'border-box', transition: 'border-color 0.2s' },
    label: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary, fontSize: '16px', pointerEvents: 'none', transition: 'all 0.15s ease-out', background: theme.labelBg, padding: '0 4px' },
    labelFloating: { top: '0', fontSize: '12px', transform: 'translateY(-50%)' },
    actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' },
    createAccount: { color: theme.accent, fontSize: '14px', fontWeight: '500', textDecoration: 'none' },
    nextButton: { background: theme.accent, color: isDark ? '#202124' : '#fff', border: 'none', borderRadius: '4px', padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' },
    divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0' },
    line: { flex: 1, height: '1px', background: theme.border },
    orText: { fontSize: '13px', color: theme.textSecondary },
    googleButton: { width: '100%', height: '40px', background: isDark ? 'transparent' : '#fff', border: `1px solid ${theme.border}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '14px', color: isDark ? '#e8eaed' : '#3c4043', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    googleIcon: { width: '18px', height: '18px' },
});
