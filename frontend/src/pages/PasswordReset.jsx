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

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/password-reset/', { email });
            setMessage('Sifre sifirlama linki gonderildi.');
        } catch (err) {
            setError('Bir hata olustu.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/password-reset/confirm/', {
                token,
                new_password: newPassword
            });
            setMessage('Sifre basariyla guncellendi.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata olustu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Sifre Sifirlama</h2>

                {message && <p style={styles.success}>{message}</p>}
                {error && <p style={styles.error}>{error}</p>}

                {token ? (
                    // Token varsa yeni sifre formu
                    <form onSubmit={handleConfirmReset}>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Yeni sifre (min 8 karakter)"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Guncelleniyor...' : 'Sifremi Guncelle'}
                        </button>
                    </form>
                ) : (
                    // Token yoksa email formu
                    <form onSubmit={handleRequestReset}>
                        <p style={styles.subtitle}>
                            E-posta adresinizi girin, sifre sifirlama linki gonderilecektir.
                        </p>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="E-posta"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Gonderiliyor...' : 'Link Gonder'}
                        </button>
                    </form>
                )}

                <p style={styles.backText}>
                    <Link to="/login" style={styles.link}>Girise don</Link>
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
    title: { textAlign: 'center', marginBottom: '16px', color: '#1a1a2e' },
    subtitle: { color: '#666', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
    input: {
        width: '100%', padding: '12px', marginBottom: '12px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box'
    },
    button: {
        width: '100%', padding: '12px', background: '#7c3aed',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: 'pointer', marginBottom: '12px'
    },
    error: { color: 'red', marginBottom: '12px', fontSize: '14px' },
    success: { color: 'green', marginBottom: '12px', fontSize: '14px' },
    backText: { textAlign: 'center', marginTop: '8px' },
    link: { color: '#7c3aed', fontSize: '13px' }
};