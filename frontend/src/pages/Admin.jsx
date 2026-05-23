import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// ─────────────────────────────────────────────
// Yardımcı bileşenler
// ─────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <section style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
                {title}
            </h3>
            {children}
        </section>
    );
}

function StatCard({ label, value }) {
    return (
        <div style={{
            background: 'var(--card-bg, #f9fafb)',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '1rem 1.25rem',
            minWidth: 130,
            textAlign: 'center',
        }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{value ?? '—'}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
        </div>
    );
}

function Table({ columns, rows, renderRow }) {
    if (!rows.length) return <p style={{ color: '#6b7280' }}>Kayıt bulunamadı.</p>;
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col} style={{ textAlign: 'left', padding: '6px 10px', background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{rows.map((row, i) => renderRow(row, i))}</tbody>
            </table>
        </div>
    );
}

function Btn({ onClick, disabled, children, variant = 'default' }) {
    const colors = {
        default: { background: '#3b82f6', color: '#fff' },
        danger: { background: '#ef4444', color: '#fff' },
        success: { background: '#10b981', color: '#fff' },
        ghost: { background: '#e5e7eb', color: '#374151' },
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...colors[variant],
                border: 'none',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 13,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                marginRight: 4,
            }}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────
// 1. İstatistik Kartları
// ─────────────────────────────────────────────

function StatsSection() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/reports/admin/stats/')
            .then(r => setStats(r.data))
            .catch(() => setError('İstatistikler yüklenemedi.'));
    }, []);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!stats) return <p>Yükleniyor…</p>;

    const cards = [
        ['Toplam Kullanıcı', stats.total_users],
        ['Doğrulanmış', stats.verified_users],
        ['Banlı', stats.banned_users],
        ['Toplam Gönderi', stats.total_posts],
        ['Aktif Gönderi', stats.active_posts],
        ['Pasif Gönderi', stats.passive_posts],
        ['Toplam Rapor', stats.total_reports],
        ['Bugünkü Gönderi', stats.posts_today],
    ];

    return (
        <Section title="İstatistikler">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                {cards.map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
            </div>

            <h4 style={{ marginBottom: 8 }}>Coğrafi Dağılım</h4>
            <Table
                columns={['Ülke', 'Kullanıcı Sayısı']}
                rows={stats.users_by_country}
                renderRow={(row, i) => (
                    <tr key={i}>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #f3f4f6' }}>{row.country || '(Belirtilmemiş)'}</td>
                        <td style={{ padding: '5px 10px', borderBottom: '1px solid #f3f4f6' }}>{row.count}</td>
                    </tr>
                )}
            />
        </Section>
    );
}

// ─────────────────────────────────────────────
// 2. Tarih Aralığı Gönderi İstatistiği
// ─────────────────────────────────────────────

function PostStatsSection() {
    const today = new Date().toISOString().slice(0, 10);
    const [start, setStart] = useState(today);
    const [end, setEnd] = useState(today);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        setError('');
        api.get(`/reports/admin/stats/posts/?start=${start}&end=${end}`)
            .then(r => setResult(r.data))
            .catch(() => setError('Veri yüklenemedi.'))
            .finally(() => setLoading(false));
    };

    return (
        <Section title="Tarih Aralığı Gönderi İstatistiği">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <label>Başlangıç: <input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
                <label>Bitiş: <input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
                <Btn onClick={load} disabled={loading}>Listele</Btn>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {result && (
                <>
                    <p style={{ marginBottom: 8 }}>
                        <strong>{result.start}</strong> — <strong>{result.end}</strong> arası toplam: <strong>{result.total}</strong> gönderi
                    </p>
                    <Table
                        columns={['Tarih', 'Gönderi Sayısı']}
                        rows={result.daily}
                        renderRow={(row, i) => (
                            <tr key={i}>
                                <td style={{ padding: '5px 10px', borderBottom: '1px solid #f3f4f6' }}>{row.date}</td>
                                <td style={{ padding: '5px 10px', borderBottom: '1px solid #f3f4f6' }}>{row.count}</td>
                            </tr>
                        )}
                    />
                </>
            )}
        </Section>
    );
}

// ─────────────────────────────────────────────
// 3. Raporlar Tablosu
// ─────────────────────────────────────────────

function ReportsSection() {
    const [posts, setPosts] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchReports = () => {
        api.get('/reports/admin/reports/')
            .then(r => setPosts(r.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchReports(); }, []);

    const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const deactivate = id => {
        api.post(`/reports/admin/posts/${id}/deactivate/`).then(() => {
            setPosts(prev => prev.map(p => p.post_id === id ? { ...p, post_is_active: false } : p));
        });
    };

    const activate = id => {
        api.post(`/reports/admin/posts/${id}/activate/`).then(() => {
            setPosts(prev => prev.map(p => p.post_id === id ? { ...p, post_is_active: true } : p));
        });
    };

    if (loading) return <Section title="Raporlar"><p>Yükleniyor…</p></Section>;

    return (
        <Section title="Raporlar">
            <Table
                columns={['Gönderi İçeriği', 'Yazar', 'Rapor Sayısı', 'Gerekçeler', 'Durum', 'İşlemler']}
                rows={posts}
                renderRow={(post, i) => (
                    <>
                        <tr
                            key={`row-${i}`}
                            style={{ cursor: 'pointer', background: i % 2 === 0 ? '#fff' : '#f9fafb' }}
                            onClick={() => toggle(post.post_id)}
                        >
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {post.post_content}
                            </td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{post.post_author}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{post.report_count}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{[...new Set(post.reasons)].join(', ')}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: post.post_is_active ? '#10b981' : '#ef4444' }}>
                                    {post.post_is_active ? 'Aktif' : 'Pasif'}
                                </span>
                            </td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }} onClick={e => e.stopPropagation()}>
                                {post.post_is_active
                                    ? <Btn variant="danger" onClick={() => deactivate(post.post_id)}>Pasife Al</Btn>
                                    : <Btn variant="success" onClick={() => activate(post.post_id)}>Aktif Et</Btn>
                                }
                            </td>
                        </tr>
                        {expanded[post.post_id] && (
                            <tr key={`exp-${i}`}>
                                <td colSpan={6} style={{ padding: '8px 20px', background: '#f0f9ff', borderBottom: '1px solid #e5e7eb' }}>
                                    <strong>Raporlar:</strong>
                                    <ul style={{ margin: '6px 0', paddingLeft: 20 }}>
                                        {post.reports.map((r, j) => (
                                            <li key={j} style={{ fontSize: 13 }}>
                                                <strong>{r.reporter_username}</strong> — {r.reason} — {new Date(r.created_at).toLocaleString('tr-TR')}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        )}
                    </>
                )}
            />
        </Section>
    );
}

// ─────────────────────────────────────────────
// 4. Kullanıcı Yönetimi
// ─────────────────────────────────────────────

function UsersSection() {
    const { user: me } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [banForm, setBanForm] = useState(null); // { username }
    const [banType, setBanType] = useState('temporary');
    const [banDays, setBanDays] = useState('');

    const fetchUsers = (q = '') => {
        setLoading(true);
        api.get(`/reports/admin/users/${q ? `?search=${q}` : ''}`)
            .then(r => setUsers(r.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const ban = (username) => {
        const body = banType === 'temporary' && banDays ? { duration_days: parseInt(banDays) } : {};
        api.post(`/reports/admin/users/${username}/ban/`, body).then(() => {
            setBanForm(null);
            fetchUsers(search);
        });
    };

    const unban = (username) => {
        api.post(`/reports/admin/users/${username}/unban/`).then(() => fetchUsers(search));
    };

    return (
        <Section title="Kullanıcı Yönetimi">
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                    placeholder="Kullanıcı adı ara…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, flex: 1, maxWidth: 300 }}
                />
                <Btn onClick={() => fetchUsers(search)} disabled={loading}>Ara</Btn>
            </div>

            {banForm && (
                <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'inline-block' }}>
                    <strong>{banForm.username}</strong> için ban uygula:
                    <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <label>
                            <input type="radio" value="temporary" checked={banType === 'temporary'} onChange={() => setBanType('temporary')} /> Geçici
                        </label>
                        <label>
                            <input type="radio" value="permanent" checked={banType === 'permanent'} onChange={() => setBanType('permanent')} /> Kalıcı
                        </label>
                        {banType === 'temporary' && (
                            <input
                                type="number"
                                min="1"
                                placeholder="Gün sayısı"
                                value={banDays}
                                onChange={e => setBanDays(e.target.value)}
                                style={{ width: 100, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}
                            />
                        )}
                        <Btn variant="danger" onClick={() => ban(banForm.username)}>Uygula</Btn>
                        <Btn variant="ghost" onClick={() => setBanForm(null)}>İptal</Btn>
                    </div>
                </div>
            )}

            <Table
                columns={['Kullanıcı Adı', 'E-Posta', 'Ülke', 'Doğrulanmış', 'Ban Durumu', 'Ban Bitiş', 'İşlemler']}
                rows={users}
                renderRow={(u, i) => {
                    const isSelf = u.username === me?.username;
                    return (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{u.username}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{u.email}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{u.country || '—'}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{u.is_email_verified ? '✓' : '✗'}</td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6', color: u.is_banned ? '#ef4444' : '#10b981' }}>
                                {u.is_banned ? 'Banlı' : 'Aktif'}
                            </td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>
                                {u.banned_until ? new Date(u.banned_until).toLocaleDateString('tr-TR') : '—'}
                            </td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>
                                {!u.is_banned ? (
                                    <Btn variant="danger" disabled={isSelf} onClick={() => { setBanForm({ username: u.username }); setBanDays(''); setBanType('temporary'); }}>
                                        Banla
                                    </Btn>
                                ) : (
                                    <Btn variant="success" disabled={isSelf} onClick={() => unban(u.username)}>Ban Kaldır</Btn>
                                )}
                            </td>
                        </tr>
                    );
                }}
            />
        </Section>
    );
}

// ─────────────────────────────────────────────
// 5. Audit Log
// ─────────────────────────────────────────────

function AuditLogSection() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const loadMore = () => {
        api.get(`/reports/admin/audit-log/?page=${page}`).then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data.results || []);
            setLogs(prev => [...prev, ...data]);
            if (data.length < PAGE_SIZE) setHasMore(false);
            setPage(p => p + 1);
        });
    };

    useEffect(() => { loadMore(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const ACTION_LABELS = {
        ban: 'Ban',
        unban: 'Ban Kaldır',
        deactivate: 'Pasife Al',
        activate: 'Aktife Al',
    };

    return (
        <Section title="İşlem Geçmişi (Audit Log)">
            <Table
                columns={['Admin', 'İşlem', 'Hedef Kullanıcı', 'Hedef Gönderi', 'Detay', 'Tarih']}
                rows={logs}
                renderRow={(log, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{log.admin_username}</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{ACTION_LABELS[log.action] || log.action}</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{log.target_user_username || '—'}</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{log.target_post_id || '—'}</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{log.detail || '—'}</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString('tr-TR')}
                        </td>
                    </tr>
                )}
            />
            {hasMore && <Btn onClick={loadMore} variant="ghost" style={{ marginTop: 10 }}>Daha fazla yükle</Btn>}
        </Section>
    );
}

// ─────────────────────────────────────────────
// Pasif Gönderiler Bölümü
// ─────────────────────────────────────────────

function PassivePostsSection() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        setLoading(true);
        api.get('/reports/admin/posts/?is_active=false')
            .then(r => setPosts(r.data || []))
            .finally(() => setLoading(false));
    }, []);

    const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const activate = id => {
        api.post(`/reports/admin/posts/${id}/activate/`).then(() => {
            setPosts(prev => prev.filter(p => p.id !== id));
        });
    };

    if (loading) return <Section title="Pasif Gönderiler"><p>Yükleniyor…</p></Section>;
    if (!posts.length) return <Section title="Pasif Gönderiler"><p style={{ color: '#6b7280' }}>Pasif gönderi yok.</p></Section>;

    return (
        <Section title="Pasif Gönderiler">
            <Table
                columns={['İçerik', 'Yazar', 'İşlemler']}
                rows={posts}
                renderRow={(post, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {post.content}
                        </td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>{post.author_username}</td>
                        <td style={{ padding: '6px 10px', borderBottom: '1px solid #f3f4f6' }}>
                            <Btn variant="success" onClick={() => activate(post.id)}>Aktife Al</Btn>
                        </td>
                    </tr>
                )}
            />
        </Section>
    );
}

// ─────────────────────────────────────────────
// Ana Admin Sayfası
// ─────────────────────────────────────────────

export default function Admin() {
    return (
        <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Admin Paneli</h2>
            <StatsSection />
            <PostStatsSection />
            <ReportsSection />
            <PassivePostsSection />
            <UsersSection />
            <AuditLogSection />
        </div>
    );
}
