import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';

const Home = () => <div style={{ padding: '2rem' }}><h2>Ana Sayfa (Feed)</h2><p>Bu sayfa geliştiriliyor...</p></div>;
const Profile = () => <div style={{ padding: '2rem' }}><h2>Profil</h2><p>Bu sayfa geliştiriliyor...</p></div>;
const Admin = () => <div style={{ padding: '2rem' }}><h2>Admin Paneli</h2><p>Bu sayfa geliştiriliyor...</p></div>;

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ padding: '2rem' }}>Yukleniyor...</div>;
    return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ padding: '2rem' }}>Yukleniyor...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? children : <Navigate to="/" replace />;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ padding: '2rem' }}>Yukleniyor...</div>;
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