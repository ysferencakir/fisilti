import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const COUNTRIES = [
    'Turkiye', 'Amerika', 'Almanya', 'Fransa', 'Ingiltere',
    'Japonya', 'Rusya', 'Cin', 'Hindistan', 'Brezilya'
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: '', email: '', password: '', country: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) {
            setError('Kullanim sartlarini kabul etmelisiniz.');
            return;
        }
        if (form.password.length < 8) {
            setError('Sifre en az 8 karakter olmalidir.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register/', form);
            navigate('/verify-email?email=' + form.email);
        } catch (err) {
            setError(err.response?.data?.detail || 'Kayit sirasinda hata olustu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Kayit Ol</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        name="username"
                        placeholder="Kullanici adi"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
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
                        placeholder="Sifre (min 8 karakter)"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <p style={styles.charCount}>{form.password.length}/8 karakter</p>
                    <select
                        style={styles.input}
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                    >
                        <option value="">Ulke secin (opsiyonel)</option>
                        {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <div style={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            id="terms"
                        />
                        <label htmlFor="terms" style={styles.checkboxLabel}>
                            Kullanim Sartlari ve Gizlilik Politikasini kabul ediyorum
                        </label>
                    </div>
                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Kayit yapiliyor...' : 'Kayit Ol'}
                    </button>
                </form>
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
    charCount: { fontSize: '12px', color: '#888', marginTop: '-8px', marginBottom: '8px' },
    checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
    checkboxLabel: { fontSize: '13px', color: '#555' },
    button: {
        width: '100%', padding: '12px', background: '#7c3aed',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: 'pointer'
    },
    error: { color: 'red', marginBottom: '12px', fontSize: '14px' }
};