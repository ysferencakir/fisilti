import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Shield, LogOut, Sun, Moon, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FennecLogo from './FennecLogo';
import { getAnimal, avatarStyle } from '../utils/animals';

const ACCENT = 'var(--accent)';
const ACCENT_BG = 'var(--accent-bg)';

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '11px 16px',
        borderRadius: 9999,
        textDecoration: 'none',
        color: isActive ? 'var(--accent)' : 'var(--text-h)',
        fontWeight: isActive ? 700 : 500,
        fontSize: 16,
        background: isActive ? ACCENT_BG : 'transparent',
        transition: 'background 0.15s, color 0.15s',
        letterSpacing: '-0.01em',
      })}
      onMouseEnter={e => { e.currentTarget.style.background = ACCENT_BG; }}
      onMouseLeave={e => {
        const active = e.currentTarget.getAttribute('aria-current') === 'page';
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon size={22} strokeWidth={1.75} />
      <span className="left-sidebar-text">{label}</span>
    </NavLink>
  );
}

export default function LeftSidebar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="left-sidebar" style={{
      position: 'sticky',
      top: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px 20px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      {/* Logo */}
      <NavLink to="/" className="left-sidebar-brand" style={{ textDecoration: 'none', marginBottom: 4 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 9999,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = ACCENT_BG; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <FennecLogo size={36} />
          <span className="left-sidebar-text" style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--accent)',
            letterSpacing: '-0.5px',
            fontFamily: 'var(--heading)',
          }}>Fısıltı</span>
        </div>
      </NavLink>

      {/* Nav */}
      <nav className="left-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem to="/" icon={Home} label="Ana Sayfa" end />
        {user && (
          <>
            <NavItem to="/search" icon={Search} label="Arama" />
            <NavItem to={`/profile/${user.username}`} icon={User} label="Profil" />
          </>
        )}
        {user?.role === 'admin' && (
          <NavItem to="/admin" icon={Shield} label="Admin Paneli" />
        )}
      </nav>

      {/* Fısılda butonu */}
      <button
        className="left-sidebar-post-btn"
        onClick={() => navigate('/')}
        style={{
          marginTop: 16,
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: 9999,
          padding: '13px 0',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'var(--heading)',
          letterSpacing: '-0.01em',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        <span className="post-btn-text">Fısılda</span>
      </button>

      {/* Spacer */}
      <div className="left-sidebar-spacer" style={{ flex: 1 }} />

      {/* Dark / Light toggle */}
      <button
        className="left-sidebar-theme-btn"
        onClick={toggle}
        title={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderRadius: 9999,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: 15,
          fontWeight: 500,
          fontFamily: 'var(--sans)',
          width: '100%',
          transition: 'background 0.15s',
          marginBottom: 4,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = ACCENT_BG; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        {theme === 'dark'
          ? <Sun size={20} strokeWidth={1.75} />
          : <Moon size={20} strokeWidth={1.75} />
        }
        <span className="left-sidebar-text">
          {theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
        </span>
      </button>

      {/* Kullanıcı footer — desktop/tablet */}
      {user && (
        <div className="left-sidebar-user" style={{
          paddingTop: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ ...avatarStyle(user.animal_avatar, 38) }}>
            {getAnimal(user.animal_avatar).emoji}
          </div>
          <div className="left-sidebar-text" style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700,
              color: 'var(--text-h)',
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.username}
            </div>
            <div style={{
              color: 'var(--text)',
              fontSize: 12,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              @{user.username}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              padding: 6,
              borderRadius: 9999,
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; }}
          >
            <LogOut size={17} />
          </button>
        </div>
      )}

      {/* Logout — sadece mobil bottom nav'da görünür */}
      {user && (
        <button
          className="left-sidebar-logout-btn"
          onClick={handleLogout}
          title="Çıkış Yap"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            borderRadius: 9999,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; }}
        >
          <LogOut size={22} strokeWidth={1.75} />
        </button>
      )}
    </aside>
  );
}
