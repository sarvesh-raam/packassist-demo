import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

export default function Header() {
    const { theme, isDark } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showMenu, setShowMenu] = useState(false);
    const isMobile = useIsMobile();

    const isAuthPage = ['/', '/signin', '/signup'].includes(location.pathname);

    const handleLogout = async () => {
        await logout();
        navigate('/signin');
    };

    // Derive avatar initials
    const initials = user?.displayName
        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? 'U';

    const styles = {
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: isAuthPage ? 'transparent' : (isDark ? '#000' : theme.cardBg), position: 'relative' as const, zIndex: 50 },
        brand: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
        logoMark: { width: '32px', height: '32px', borderRadius: '8px', background: theme.accent, color: isDark ? '#202124' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', letterSpacing: '1px' },
        appName: { fontSize: '18px', color: theme.text, fontWeight: '600', letterSpacing: '-0.4px' },
        userSection: { position: 'relative' as const },
        profileBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', color: theme.text },
        avatar: { width: '32px', height: '32px', borderRadius: '50%', background: theme.accent, color: isDark ? '#202124' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' },
        emailText: { fontSize: '13px', color: theme.textSecondary, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
        dropdown: { position: 'absolute' as const, top: '100%', right: 0, marginTop: '8px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '8px', boxShadow: theme.shadowMd ?? '0 8px 32px rgba(0,0,0,0.3)', minWidth: '180px', zIndex: 1000 },
        menuItem: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: theme.text, fontSize: '14px', cursor: 'pointer', borderRadius: '8px', textAlign: 'left' as const },
        loginBtn: { background: theme.accent, color: isDark ? '#202124' : '#fff', padding: '8px 24px', border: 'none', borderRadius: '100px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    };

    return (
        <header style={styles.header}>
            <div style={styles.brand} onClick={() => navigate(user ? '/cars' : '/')}>
                <div style={styles.logoMark}>PA</div>
                {!isMobile && <span style={styles.appName}>PackAssist</span>}
                <div style={{ background: 'rgba(138, 180, 248, 0.1)', border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '2px 8px', fontSize: '10px', color: theme.accent, fontWeight: '700', marginLeft: '8px', textTransform: 'uppercase' }}>Portfolio Demo</div>
            </div>

            {user && !isAuthPage ? (
                <div style={styles.userSection} onClick={() => setShowMenu(!showMenu)}>
                    <button style={styles.profileBtn}>
                        <div style={styles.avatar}>{initials}</div>
                        {!isMobile && <span style={styles.emailText}>{user.displayName || user.email}</span>}
                        <ChevronDown size={14} color={theme.textSecondary} style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {showMenu && (
                        <>
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={e => { e.stopPropagation(); setShowMenu(false); }} />
                            <div style={styles.dropdown}>
                                <button
                                    style={styles.menuItem}
                                    onClick={e => { e.stopPropagation(); handleLogout(); }}
                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f3f4'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : location.pathname === '/signup' ? (
                <button style={styles.loginBtn} onClick={() => navigate('/signin')}>Sign In</button>
            ) : location.pathname === '/signin' ? (
                <button style={styles.loginBtn} onClick={() => navigate('/signup')}>Sign Up</button>
            ) : null}
        </header>
    );
}
