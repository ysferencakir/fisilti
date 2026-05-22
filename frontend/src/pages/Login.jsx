import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            const status = err.response?.status;
            const detail = err.response?.data?.detail || err.response?.data?.message || 'Bir hata oluştu';

            if (status === 429) {
                setError('Çok fazla hatalı deneme. Lütfen bekleyin.');
            } else if (status === 403) {
                if (detail.includes('askıya')) {
                    setError('Hesabınız askıya alınmıştır.');
                } else if (detail.includes('doğrula')) {
                    setError('E-postanızı doğrulayın.');
                } else if (detail.includes('pasif')) {
                    setError('Bu hesap pasife alınmıştır.');
                } else {
                    setError(detail);
                }
            } else if (status === 401) {
                setError('E-posta veya şifre hatalı.');
            } else {
                setError(detail);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Giriş Yap</h2>
                {error && (
                    <div>
                        <p style={styles.error}>{error}</p>
                        {error.includes('doğrula') && (
                            <Link to="/verify-email" style={styles.link}>
                                E-postanızı doğrulayın
                            </Link>
                        )}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="E-posta"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <input
                        style={styles.input}
                        name="password"
                        type="password"
                        placeholder="Şifre"
                        value={form.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <div style={styles.forgotRow}>
                        <Link to="/password-reset" style={styles.link}>
                            Şifremi Unuttum
                        </Link>
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
                <p style={styles.registerText}>
                    Hesabınız yok mu?{' '}
                    <Link to="/register" style={styles.link}>Kayıt Ol</Link>
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
        background: 'var(--card-bg)', padding: '40px',
        borderRadius: '16px', width: '100%',
        maxWidth: '400px', boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
    },
    title: { textAlign: 'center', marginBottom: '24px', color: 'var(--text-h)', fontFamily: 'var(--heading)' },
    input: {
        width: '100%', padding: '12px', marginBottom: '12px',
        border: '1px solid var(--border)', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none',
        background: 'var(--bg)', color: 'var(--text-h)',
        fontFamily: 'var(--sans)',
    },
    forgotRow: { textAlign: 'right', marginBottom: '16px' },
    button: {
        width: '100%', padding: '12px', background: '#F97316',
        color: 'white', border: 'none', borderRadius: '9999px',
        fontSize: '16px', cursor: 'pointer', fontWeight: 700
    },
    error: { color: '#EF4444', marginBottom: '8px', fontSize: '14px' },
    link: { color: '#F97316', fontSize: '13px' },
    registerText: { textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#78716C' }
};
