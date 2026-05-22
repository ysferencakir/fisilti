import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function PasswordReset() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Şifre en az 8 karakter olmalıdır';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Şifre en az bir büyük harf içermelidir';
        }
        if (!/[a-z]/.test(password)) {
            return 'Şifre en az bir küçük harf içermelidir';
        }
        if (!/[0-9]/.test(password)) {
            return 'Şifre en az bir rakam içermelidir';
        }
        return null;
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/auth/password-reset/', { email });
            setMessage('Şifre sıfırlama linki e-postanıza gönderildi. Lütfen e-postanızı kontrol edin.');
            setEmail('');
        } catch (err) {
            const detail = err.response?.data?.detail || 'Bir hata oluştu';
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setErrors({ password: passwordError });
            return;
        }

        setErrors({});
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await api.post('/auth/password-reset/confirm/', {
                token,
                new_password: newPassword
            });
            setMessage('Şifre başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const detail = err.response?.data?.detail || 'Bir hata oluştu';
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Şifre Sıfırlama</h2>

                {message && <p style={styles.success}>{message}</p>}
                {error && <p style={styles.error}>{error}</p>}

                {token ? (
                    // Token varsa yeni şifre formu
                    <form onSubmit={handleConfirmReset}>
                        <div>
                            <input
                                style={styles.input}
                                type="password"
                                placeholder="Yeni şifre"
                                value={newPassword}
                                onChange={e => {
                                    setNewPassword(e.target.value);
                                    if (errors.password) {
                                        setErrors({});
                                    }
                                }}
                                disabled={loading}
                            />
                            {errors.password && <p style={styles.fieldError}>{errors.password}</p>}
                            <p style={styles.charCount}>{newPassword.length} / 8 minimum</p>
                        </div>
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
                        </button>
                    </form>
                ) : (
                    // Token yoksa email formu
                    <form onSubmit={handleRequestReset}>
                        <p style={styles.subtitle}>
                            E-posta adresinizi girin, şifre sıfırlama linki gönderilecektir.
                        </p>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="E-posta"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Gönderiliyor...' : 'Link Gönder'}
                        </button>
                    </form>
                )}

                <p style={styles.backText}>
                    <Link to="/login" style={styles.link}>Girişe dön</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg)',
    },
    card: {
        background: 'white', padding: '40px',
        borderRadius: '16px', width: '100%',
        maxWidth: '400px', boxShadow: '0 4px 24px rgba(249,115,22,0.1)'
    },
    title: { textAlign: 'center', marginBottom: '16px', color: '#1C1917' },
    subtitle: { color: '#78716C', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
    input: {
        width: '100%', padding: '12px', marginBottom: '4px',
        border: '1px solid #FDE8D0', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none'
    },
    charCount: { fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' },
    button: {
        width: '100%', padding: '12px', background: '#F97316',
        color: 'white', border: 'none', borderRadius: '9999px',
        fontSize: '16px', cursor: 'pointer', marginBottom: '12px', fontWeight: 700
    },
    error: { color: '#EF4444', marginBottom: '12px', fontSize: '14px' },
    success: { color: '#16a34a', marginBottom: '12px', fontSize: '14px' },
    fieldError: { color: '#EF4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' },
    backText: { textAlign: 'center', marginTop: '8px' },
    link: { color: '#F97316', fontSize: '13px' }
};
