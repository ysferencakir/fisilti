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
            const detail = err.response?.data?.detail || '';
            if (status === 429) setError('Cok fazla hatali deneme. Lutfen bekleyin.');
            else if (status === 403 && detail.includes('askiya')) setError('Hesabiniz askiya alinmistir.');
            else if (status === 403 && detail.includes('dogrulayin')) setError('E-postanizi dogrulayin.');
            else if (status === 403 && detail.includes('pasife')) setError('Bu hesap pasife alinmistir.');
            else setError('E-posta veya sifre hatali.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Giris Yap</h2>
                {error && (
                    <div>
                        <p style={styles.error}>{error}</p>
                        {error.includes('dogrulayin') && (
                            <Link to="/verify-email" style={styles.link}>
                                E-postanizi dogrulayin
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
                    />
                    <input
                        style={styles.input}
                        name="password"
                        type="password"
                        placeholder="Sifre"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <div style={styles.forgotRow}>
                        <Link to="/password-reset" style={styles.link}>
                            Sifremi Unuttum
                        </Link>
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
                    </button>
                </form>
                <p style={styles.registerText}>
                    Hesabiniz yok mu?{' '}
                    <Link to="/register" style={styles.link}>Kayit Ol</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', minHeight: '100vh',
        backgroundColor: '#f0f2f5'
    },
    card: {
        background: 'white', padding: '40px',
        borderRadius: '12px', width: '100%',
        maxWidth: '400px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    title: { textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' },
    input: {
        width: '100%', padding: '12px', marginBottom: '12px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box'
    },
    forgotRow: { textAlign: 'right', marginBottom: '16px' },
    button: {
        width: '100%', padding: '12px', background: '#7c3aed',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: 'pointer'
    },
    error: { color: 'red', marginBottom: '8px', fontSize: '14px' },
    link: { color: '#7c3aed', fontSize: '13px' },
    registerText: { textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#555' }
};