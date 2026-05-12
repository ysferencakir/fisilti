import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Sayfa placeholder'ları — her modül kendi sayfasını dolduracak
const Placeholder = ({ name }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{name}</h2>
    <p>Bu sayfa geliştiriliyor...</p>
  </div>
);

const Home = () => <Placeholder name="Ana Sayfa (Feed)" />;
const Login = () => <Placeholder name="Giriş Yap" />;
const Register = () => <Placeholder name="Kayıt Ol" />;
const VerifyEmail = () => <Placeholder name="E-posta Doğrulama" />;
const PasswordReset = () => <Placeholder name="Şifre Sıfırlama" />;
const Profile = () => <Placeholder name="Profil" />;
const Admin = () => <Placeholder name="Admin Paneli" />;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/password-reset" element={<GuestRoute><PasswordReset /></GuestRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
