import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
            navigate('/verify-email?email=' + form.email);
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
                        <p style={styles.charCount}>{form.password.length}/8 minimum</p>
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
                            Kullanım Şartları ve Gizlilik Politikasını kabul ediyorum
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
        backgroundColor: '#f0f2f5'
    },
    card: {
        background: 'white', padding: '40px',
        borderRadius: '12px', width: '100%',
        maxWidth: '450px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    title: { textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' },
    input: {
        width: '100%', padding: '12px', marginBottom: '4px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box'
    },
    charCount: { fontSize: '12px', color: '#888', marginBottom: '12px' },
    checkboxRow: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' },
    checkboxLabel: { fontSize: '13px', color: '#555', paddingTop: '2px' },
    button: {
        width: '100%', padding: '12px', background: '#7c3aed',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '16px', cursor: 'pointer', marginTop: '8px'
    },
    error: { color: 'red', marginBottom: '12px', fontSize: '14px' },
    fieldError: { color: 'red', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }
};
