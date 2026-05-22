import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef([]);

    // Geri sayım
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    // Kod input handler — kutudan kutuya geç
    const handleCodeChange = (index, value) => {
        const digit = value.replace(/\D/, '').slice(-1);
        const next = [...code];
        next[index] = digit;
        setCode(next);
        if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleCodePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const next = [...code];
        pasted.split('').forEach((d, i) => { next[i] = d; });
        setCode(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const fullCode = code.join('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (fullCode.length < 6) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/auth/verify-email/', { email, code: fullCode });
            setMessage('E-posta doğrulandı! Giriş sayfasına yönlendiriliyorsunuz…');
            setTimeout(() => navigate('/login'), 1800);
        } catch (err) {
            const status = err.response?.status;
            const detail = err.response?.data?.detail || 'Doğrulama hatası';
            if (status === 429) setError('Çok fazla deneme. Lütfen bekleyin.');
            else setError(detail);
            // Hatalı kodu temizle
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || resendLoading) return;
        setMessage('');
        setError('');
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification/', { email });
            setMessage('Yeni kod gönderildi. E-postanızı kontrol edin.');
            setResendCooldown(60);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            const detail = err.response?.data?.detail || 'Kod gönderilemedi.';
            setError(detail);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div style={s.container}>
            <div style={s.card}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 4 }}>🦊</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
                        Fısıltı
                    </span>
                </div>

                <h2 style={s.title}>E-posta Doğrulama</h2>
                <p style={s.subtitle}>
                    <strong style={{ color: 'var(--text-h)' }}>{email}</strong> adresine
                    gönderilen 6 haneli kodu girin.
                </p>

                {error && (
                    <div style={s.errorBox}>⚠ {error}</div>
                )}
                {message && (
                    <div style={s.successBox}>✓ {message}</div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* E-posta değiştirme (URL'de yoksa) */}
                    {!searchParams.get('email') && (
                        <input
                            style={s.input}
                            type="email"
                            placeholder="E-posta adresiniz"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    )}

                    {/* 6 kutulu kod girişi */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                        {code.map((d, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={e => handleCodeChange(i, e.target.value)}
                                onKeyDown={e => handleCodeKeyDown(i, e)}
                                onPaste={handleCodePaste}
                                disabled={loading}
                                style={{
                                    width: 46, height: 56,
                                    textAlign: 'center',
                                    fontSize: 24, fontWeight: 700,
                                    border: `2px solid ${d ? 'var(--accent)' : 'var(--border)'}`,
                                    borderRadius: 10,
                                    background: d ? 'var(--accent-bg)' : 'var(--bg)',
                                    color: 'var(--text-h)',
                                    outline: 'none',
                                    transition: 'border-color 0.15s, background 0.15s',
                                    fontFamily: 'var(--sans)',
                                }}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || fullCode.length < 6}
                        style={{
                            ...s.btn,
                            opacity: (loading || fullCode.length < 6) ? 0.6 : 1,
                            cursor: (loading || fullCode.length < 6) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Doğrulanıyor…' : 'Doğrula'}
                    </button>
                </form>

                {/* Tekrar gönder */}
                <button
                    onClick={handleResend}
                    disabled={resendLoading || resendCooldown > 0}
                    type="button"
                    style={{
                        ...s.resendBtn,
                        opacity: (resendLoading || resendCooldown > 0) ? 0.55 : 1,
                        cursor: (resendLoading || resendCooldown > 0) ? 'not-allowed' : 'pointer',
                    }}
                >
                    {resendLoading
                        ? 'Gönderiliyor…'
                        : resendCooldown > 0
                            ? `Tekrar gönder (${resendCooldown}s)`
                            : 'Kodu Tekrar Gönder'
                    }
                </button>

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
    resendBtn: {
        width: '100%', padding: '12px', background: 'transparent',
        color: 'var(--accent)', border: '1px solid var(--accent)',
        borderRadius: 9999, fontSize: 14, fontWeight: 600,
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
