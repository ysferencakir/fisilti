import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './components/AppLayout';

import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import PasswordReset from './pages/PasswordReset';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;
    }

    return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return user.role === 'admin'
        ? children
        : <Navigate to="/" replace />;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem' }}>Yükleniyor...</div>;
    }

    return user
        ? <Navigate to="/" replace />
        : children;
}

export default function App() {
    return (
        <ThemeProvider>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Home />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />

                    <Route
                        path="/verify-email"
                        element={<VerifyEmail />}
                    />

                    <Route
                        path="/password-reset"
                        element={<PasswordReset />}
                    />

                    <Route
                        path="/profile/:username"
                        element={
                            <AppLayout>
                                <Profile />
                            </AppLayout>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AppLayout>
                                    <Admin />
                                </AppLayout>
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
        </ThemeProvider>
    );
}
