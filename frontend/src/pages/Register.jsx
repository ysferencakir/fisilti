import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const COUNTRIES = [
    'Türkiye', 'Amerika', 'Almanya', 'Fransa', 'İngiltere',
    'Japonya', 'Rusya', 'Çin', 'Hindistan', 'Brezilya'
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        ad_soyad: '', username: '', email: '',
        password: '', country: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!form.ad_soyad.trim()) {
            newErrors.ad_soyad = 'Ad soyad gereklidir';
        }

        if (!form.username.trim()) {
            newErrors.username = 'Kullanıcı adı gereklidir';
        } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(form.username)) {
            newErrors.username = 'Kullanıcı adı sadece harf, rakam ve _ içerebilir (3-50 karakter)';
        }

        if (!form.email.trim()) {
            newErrors.email = 'E-posta gereklidir';
        }

        if (!form.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (form.password.length < 8) {
            newErrors.password = 'Şifre en az 8 karakter olmalıdır';
        } else if (!/[A-Z]/.test(form.password)) {
            newErrors.password = 'Şifre en az bir büyük harf içermelidir';
        } else if (!/[a-z]/.test(form.password)) {
            newErrors.password = 'Şifre en az bir küçük harf içermelidir';
        } else if (!/[0-9]/.test(form.password)) {
            newErrors.password = 'Şifre en az bir rakam içermelidir';
        }

        if (!agreed) {
            newErrors.agreed = 'Kullanım şartlarını kabul etmelisiniz';
        }

        return newErrors;
    };

    const passwordRules = [
        { label: 'En az 8 karakter', ok: form.password.length >= 8 },
        { label: 'Büyük harf', ok: /[A-Z]/.test(form.password) },
        { label: 'Küçük harf', ok: /[a-z]/.test(form.password) },
        { label: 'Rakam', ok: /[0-9]/.test(form.password) },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.post('/auth/register/', form);
            navigate('/verify-email?email=' + encodeURIComponent(form.email));
        } catch (err) {
            const response = err.response?.data || {};
            if (typeof response === 'object') {
                setErrors(response);
            } else {
                setErrors({ general: response.detail || 'Kayıt sırasında hata oluştu' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Kayıt Ol</h2>
                {errors.general && <p style={styles.error}>{errors.general}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            style={styles.input}
                            name="ad_soyad"
                            placeholder="Ad Soyad"
                            value={form.ad_soyad}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.ad_soyad && <p style={styles.fieldError}>{errors.ad_soyad}</p>}
                    </div>

                    <div>
                        <input
                            style={styles.input}
                            name="username"
                            placeholder="Kullanıcı adı"
                            value={form.username}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.username && <p style={styles.fieldError}>{errors.username}</p>}
                    </div>

                    <div>
                        <input
                            style={styles.input}
                            name="email"
                            type="email"
                            placeholder="E-posta"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.email && <p style={styles.fieldError}>{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            style={styles.input}
                            name="password"
                            type="password"
                            placeholder="Şifre"
                            value={form.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.password && <p style={styles.fieldError}>{errors.password}</p>}
                        {form.password && (
                            <div style={styles.passwordRules}>
                                {passwordRules.map(rule => (
                                    <span key={rule.label} style={{ color: rule.ok ? '#16a34a' : '#9ca3af', fontSize: '12px', display: 'block' }}>
                                        {rule.ok ? '✓' : '✗'} {rule.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <select
                        style={styles.input}
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        <option value="">Ülke seçin (isteğe bağlı)</option>
                        {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <div style={styles.checkboxRow}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => {
                                setAgreed(e.target.checked);
                                if (errors.agreed) {
                                    setErrors({ ...errors, agreed: '' });
                                }
                            }}
                            id="terms"
                            disabled={loading}
                        />
                        <label htmlFor="terms" style={styles.checkboxLabel}>
                            <Link to="/legal/kullanim_sartlari" target="_blank" style={styles.link}>Kullanım Şartları</Link>
                            {' '}ve{' '}
                            <Link to="/legal/gizlilik_politikasi" target="_blank" style={styles.link}>Gizlilik Politikası</Link>
                            'nı okudum ve kabul ediyorum
                        </label>
                    </div>
                    {errors.agreed && <p style={styles.fieldError}>{errors.agreed}</p>}

                    <button style={styles.button} type="submit" disabled={loading}>
                        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
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
        width: '100%',
        backgroundColor: 'var(--bg)',
    },
    card: {
        background: 'var(--card-bg)', padding: '40px',
        borderRadius: '16px', width: '100%',
        maxWidth: '450px', boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
    },
    title: { textAlign: 'center', marginBottom: '24px', color: 'var(--text-h)', fontFamily: 'var(--heading)' },
    input: {
        width: '100%', padding: '12px', marginBottom: '4px',
        border: '1px solid var(--border)', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none',
        background: 'var(--bg)', color: 'var(--text-h)',
        fontFamily: 'var(--sans)',
    },
    passwordRules: { marginBottom: '12px', marginTop: '4px' },
    checkboxRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' },
    checkboxLabel: { fontSize: '13px', color: '#78716C', paddingTop: '2px' },
    link: { color: '#F97316', textDecoration: 'underline' },
    button: {
        width: '100%', padding: '12px', background: '#F97316',
        color: 'white', border: 'none', borderRadius: '9999px',
        fontSize: '16px', cursor: 'pointer', marginTop: '8px', fontWeight: 700
    },
    error: { color: '#EF4444', marginBottom: '12px', fontSize: '14px' },
    fieldError: { color: '#EF4444', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }
};
