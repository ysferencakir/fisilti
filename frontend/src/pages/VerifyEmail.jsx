import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        email: searchParams.get('email') || '',
        code: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-email/', form);
            navigate('/login');
        } catch (err) {
            const status = err.response?.status;
            if (status === 429) setError('Cok fazla deneme. Lutfen bekleyin.');
            else setError(err.response?.data?.detail || 'Dogrulama hatasi.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setMessage('');
        setError('');
        try {
            await api.post('/auth/resend-verification/', { email: form.email });
            setMessage('Yeni kod gonderildi.');
        } catch (err) {
            setError('Kod gonderilemedi.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>E-posta Dogrulama</h2>
                <p style={styles.subtitle}>E-postaniza gonderilen 6 haneli kodu girin.</p>
                {error && <p style={styles.error}>{error}</p>}
                {message && <p style={styles.success}>{message}</p>}
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
                        name="code"
                        placeholder="6 haneli kod"
                        maxLength={6}
                        value={form.code}
                        onChange={handleChange}
                        required
                    />
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Dogrulanýyor...' : 'Dogrula'}
                    </button>
                </form>
                <button style={styles.resendButton} onClick={handleResend}>
                    Kodu Tekrar Gonder
                </button>
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
    title: { textAlign: 'center', marginBottom: '8px', color: '#1a1a2e' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px' },
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
    resendButton: {
        width: '100%', padding: '12px', background: 'transparent',
        color: '#7c3aed', border: '1px solid #7c3aed', borderRadius: '8px',
        fontSize: '14px', cursor: 'pointer'
    },
    error: { color: 'red', marginBottom: '12px', fontSize: '14px' },
    success: { color: 'green', marginBottom: '12px', fontSize: '14px' }
};