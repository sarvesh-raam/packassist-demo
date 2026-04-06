import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';

export default function SignUp() {
    const { theme, isDark } = useTheme();
    const { signup } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

        setIsLoading(true);
        try {
            await signup(email, password, displayName || undefined);
            navigate('/cars');
        } catch (err: any) {
            const code = err?.code || '';
            if (code === 'auth/email-already-in-use') setError('Email already in use.');
            else if (code === 'auth/invalid-email') setError('Invalid email address.');
            else if (code === 'auth/weak-password') setError('Password too weak.');
            else setError("Couldn't create your account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const styles = getStyles(theme, isDark, isMobile);

    const renderInput = (id: string, type: string, label: string, value: string, onChange: (v: string) => void, required = true) => (
        <div style={styles.inputWrapper}>
            <input
                type={type === 'password' && showPassword ? 'text' : type}
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocusedField(id)}
                onBlur={() => setFocusedField(null)}
                style={{ ...styles.input, borderColor: focusedField === id ? theme.accent : theme.border }}
                required={required}
                disabled={isLoading}
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
                <div style={styles.leftSection}>
                    <div style={styles.logoMark}>PA</div>
                    <h1 style={styles.title}>Create Account</h1>
                    <p style={styles.subtitle}>Join PackAssist and start optimizing</p>
                </div>

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
                        {renderInput('displayName', 'text', 'Full name (optional)', displayName, setDisplayName, false)}
                        {renderInput('email', 'email', 'Email address', email, setEmail)}

                        <div style={styles.passwordRow}>
                            {renderInput('password', 'password', 'Password', password, setPassword)}
                            {renderInput('confirmPassword', 'password', 'Confirm', confirmPassword, setConfirmPassword)}
                        </div>

                        <label style={styles.showPasswordLabel}>
                            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} style={styles.checkbox} />
                            <span>Show password</span>
                        </label>

                        <div style={styles.actions}>
                            <Link to="/signin" style={styles.signInLink}>Sign in instead</Link>
                            <button
                                type="submit"
                                id="signup-submit-btn"
                                style={{ ...styles.nextButton, opacity: isLoading ? 0.7 : 1 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating...' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const getStyles = (theme: any, isDark: boolean, isMobile: boolean): Record<string, React.CSSProperties> => ({
    container: { minHeight: '100vh', background: isDark ? '#000' : theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '16px' : '24px', fontFamily: "'Google Sans','Roboto','Inter',sans-serif", transition: 'background-color 0.3s' },
    card: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', maxWidth: isMobile ? '400px' : '840px', background: theme.cardBg, borderRadius: '8px', padding: isMobile ? '32px 24px' : '48px 40px', gap: isMobile ? '32px' : '48px', border: isDark ? 'none' : `1px solid ${theme.border}`, boxShadow: theme.shadow, transition: 'background-color 0.3s' },
    leftSection: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: isMobile ? '100%' : '280px' },
    logoMark: { width: '44px', height: '44px', borderRadius: '10px', background: theme.accent, color: isDark ? '#202124' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', marginBottom: '24px', letterSpacing: '1px' },
    title: { fontSize: isMobile ? '28px' : '36px', fontWeight: '400', color: isDark ? theme.accent : theme.text, margin: '0 0 6px 0', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '13px', color: theme.textSecondary, margin: 0 },
    rightSection: { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: isMobile ? '100%' : '300px' },
    errorBox: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: theme.errorBg, border: isDark ? `1px solid ${theme.error}` : 'none', borderRadius: '4px', marginBottom: '24px', color: theme.error, fontSize: '14px' },
    errorIcon: { width: '20px', height: '20px', flexShrink: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    passwordRow: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' },
    inputWrapper: { position: 'relative', flex: 1 },
    input: { width: '100%', height: '56px', padding: '16px', paddingTop: '24px', fontSize: '16px', color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px', outline: 'none', background: theme.inputBg, boxSizing: 'border-box', transition: 'border-color 0.2s' },
    label: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary, fontSize: '16px', pointerEvents: 'none', transition: 'all 0.15s ease-out', background: theme.labelBg, padding: '0 4px' },
    labelFloating: { top: '0', fontSize: '12px', transform: 'translateY(-50%)' },
    showPasswordLabel: { display: 'flex', alignItems: 'center', gap: '12px', color: theme.text, fontSize: '14px', cursor: 'pointer' },
    checkbox: { width: '18px', height: '18px', accentColor: theme.accent, cursor: 'pointer' },
    actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' },
    signInLink: { color: theme.accent, fontSize: '14px', fontWeight: '500', textDecoration: 'none' },
    nextButton: { background: theme.accent, color: isDark ? '#202124' : '#fff', border: 'none', borderRadius: '4px', padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' },
});
