import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function PasswordReset() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Request form state
    const [email, setEmail] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestError, setRequestError] = useState('');

    // Confirm form state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return 'Şifre en az 8 karakter olmalıdır';
        if (!/[A-Z]/.test(pwd)) return 'Şifre en az bir büyük harf içermelidir';
        if (!/[a-z]/.test(pwd)) return 'Şifre en az bir küçük harf içermelidir';
        if (!/[0-9]/.test(pwd)) return 'Şifre en az bir rakam içermelidir';
        return null;
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        setRequestError('');
        setRequestMessage('');
        if (!email) { setRequestError('E-posta adresinizi girin.'); return; }
        setRequestLoading(true);
        try {
            await api.post('/auth/password-reset/', { email });
            setRequestMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        } catch (err) {
            setRequestError(err.response?.data?.detail || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleConfirmSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!password || !confirmPassword) { setError('Lütfen tüm alanları doldurun.'); return; }
        const pwdError = validatePassword(password);
        if (pwdError) { setError(pwdError); return; }
        if (password !== confirmPassword) { setError('Şifreler eşleşmiyor.'); return; }

        setLoading(true);
        try {
            await api.post('/auth/password-reset/confirm/', { token, new_password: password });
            setMessage('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz…');
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            setError(err.response?.data?.detail || 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.');
        } finally {
            setLoading(false);
        }
    };

    // --- Token yoksa: email request formu ---
    if (!token) {
        return (
            <div style={s.container}>
                <div style={s.card}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <span style={{ fontSize: 32, display: 'block', marginBottom: 4 }}>🦊</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
                            Fısıltı
                        </span>
                    </div>
                    <h2 style={s.title}>Şifreni Sıfırla</h2>
                    <p style={s.subtitle}>E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.</p>

                    {requestError && <div style={s.errorBox}>⚠ {requestError}</div>}
                    {requestMessage && <div style={s.successBox}>✓ {requestMessage}</div>}

                    {!requestMessage && (
                        <form onSubmit={handleRequestSubmit}>
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={requestLoading}
                                style={s.input}
                                required
                            />
                            <button
                                type="submit"
                                disabled={requestLoading || !email}
                                style={{
                                    ...s.btn,
                                    opacity: (requestLoading || !email) ? 0.6 : 1,
                                    cursor: (requestLoading || !email) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {requestLoading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
                            </button>
                        </form>
                    )}

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text)' }}>
                        <Link to="/login" style={{ color: 'var(--accent)' }}>Girişe dön</Link>
                    </p>
                </div>
            </div>
        );
    }

    // --- Token varsa: yeni şifre formu ---
    return (
        <div style={s.container}>
            <div style={s.card}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 4 }}>🦊</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
                        Fısıltı
                    </span>
                </div>

                <h2 style={s.title}>Yeni Şifre Belirle</h2>
                <p style={s.subtitle}>Yeni şifrenizi girin.</p>

                {error && <div style={s.errorBox}>⚠ {error}</div>}
                {message && <div style={s.successBox}>✓ {message}</div>}

                {!message && (
                    <form onSubmit={handleConfirmSubmit}>
                        <input
                            type="password"
                            placeholder="Yeni Şifre"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            style={s.input}
                        />
                        <input
                            type="password"
                            placeholder="Şifre Tekrar"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            style={s.input}
                        />
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            style={{
                                ...s.btn,
                                opacity: (loading || !password || !confirmPassword) ? 0.6 : 1,
                                cursor: (loading || !password || !confirmPassword) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Sıfırlanıyor…' : 'Şifre Sıfırla'}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text)' }}>
                    <Link to="/login" style={{ color: 'var(--accent)' }}>Girişe dön</Link>
                </p>
            </div>
        </div>
    );
}

const s = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg)',
    },
    card: {
        background: 'var(--card-bg)', padding: '36px 40px',
        borderRadius: 20, width: '100%', maxWidth: 420,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
    },
    title: {
        textAlign: 'center', marginBottom: 6, fontSize: 20,
        fontWeight: 800, color: 'var(--text-h)', fontFamily: 'var(--heading)',
    },
    subtitle: {
        textAlign: 'center', color: 'var(--text)', marginBottom: 20,
        fontSize: 14, lineHeight: 1.6,
    },
    input: {
        width: '100%', padding: '12px', marginBottom: '16px',
        border: '1px solid var(--border)', borderRadius: 8,
        fontSize: 14, boxSizing: 'border-box', outline: 'none',
        background: 'var(--bg)', color: 'var(--text-h)',
        fontFamily: 'var(--sans)',
    },
    btn: {
        width: '100%', padding: '13px', background: 'var(--accent)',
        color: 'white', border: 'none', borderRadius: 9999,
        fontSize: 16, fontWeight: 700, marginBottom: 12,
        fontFamily: 'var(--sans)', transition: 'opacity 0.15s',
    },
    errorBox: {
        background: '#FEF2F2', border: '1px solid #FECACA',
        color: '#DC2626', borderRadius: 10, padding: '10px 14px',
        fontSize: 13, marginBottom: 14,
    },
    successBox: {
        background: '#F0FDF4', border: '1px solid #BBF7D0',
        color: '#16A34A', borderRadius: 10, padding: '10px 14px',
        fontSize: 13, marginBottom: 14,
    },
};
