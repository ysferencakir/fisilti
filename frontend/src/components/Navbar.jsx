import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#fff',
    }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#111' }}>
        Fısıltı
      </Link>

      <span style={{ flex: 1 }} />

      {user ? (
        <>
          <Link to={`/profile/${user.username}`}>{user.username}</Link>
          {user.role === 'admin' && (
            <Link to="/admin">Admin Panel</Link>
          )}
          <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Çıkış Yap
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Giriş Yap</Link>
          <Link to="/register">Kayıt Ol</Link>
        </>
      )}
    </nav>
  );
}
