import { useParams, Link } from 'react-router-dom';

const CONTENT = {
    kullanim_sartlari: {
        title: 'Kullanım Şartları',
        sections: [
            {
                heading: '1. Genel Hükümler',
                body: 'Fısıltı platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız platformu kullanmamanızı tavsiye ederiz.',
            },
            {
                heading: '2. Hesap Oluşturma',
                body: 'Kayıt olurken gerçek ve doğru bilgi vermelisiniz. Hesabınızı başkasıyla paylaşmamalısınız. Aynı e-posta adresiyle yalnızca bir hesap açılabilir. 18 yaşından küçükseniz ebeveyn/vasi onayı gereklidir.',
            },
            {
                heading: '3. İçerik Kuralları',
                body: 'Platformda iftira, hakaret, şiddet, nefret söylemi, spam, yanıltıcı bilgi veya yasa dışı içerik paylaşılamaz. E-posta, telefon, adres gibi kişisel veri paylaşımı yasaktır. Gönderdiğiniz içeriklerden hukuki olarak siz sorumlusunuz.',
            },
            {
                heading: '4. Moderasyon ve Yaptırımlar',
                body: 'Kural ihlali tespit edilen gönderiler admin tarafından gizlenebilir. Tekrarlayan ihlallerde hesabınız geçici veya kalıcı olarak askıya alınabilir. İçeriğinize itiraz için destek hattına başvurabilirsiniz.',
            },
            {
                heading: '5. Hesap Sonlandırma',
                body: 'Hesabınızı istediğiniz zaman pasife alabilirsiniz. Fısıltı, şartları ihlal eden hesapları önceden bildirmeksizin askıya alma ya da silme hakkını saklı tutar.',
            },
            {
                heading: '6. Sorumluluk Sınırı',
                body: 'Fısıltı; kullanıcı içerikleri, platform kesintileri veya veri kayıpları nedeniyle doğabilecek zararlardan sorumlu tutulamaz. Platform "olduğu gibi" sunulmaktadır.',
            },
            {
                heading: '7. Değişiklikler',
                body: 'Bu şartlar önceden bildirmeksizin güncellenebilir. Güncel hali her zaman bu sayfada yayımlanır.',
            },
        ],
    },
    gizlilik_politikasi: {
        title: 'Gizlilik Politikası',
        sections: [
            {
                heading: '1. Toplanan Veriler',
                body: 'Kayıt sırasında ad soyad, kullanıcı adı, e-posta adresi, ülke bilgisi ve şifre (hashlenmiş) alınır. Kullanım sırasında paylaştığınız gönderiler, takip ettiğiniz hesaplar ve raporlar tutulur. Oturum açma girişimleri güvenlik amaçlı loglanır.',
            },
            {
                heading: '2. Verilerin Kullanımı',
                body: 'Verileriniz; hesap yönetimi, e-posta doğrulama, içerik moderasyonu ve platform istatistikleri (ülke dağılımı gibi anonimleştirilmiş veriler) için kullanılır. Verileriniz üçüncü taraflarla ticari amaçla paylaşılmaz.',
            },
            {
                heading: '3. E-Posta Gizliliği',
                body: 'E-posta adresiniz diğer kullanıcılara gösterilmez. Yalnızca doğrulama, şifre sıfırlama ve önemli sistem bildirimleri için kullanılır.',
            },
            {
                heading: '4. Çerezler ve Oturum',
                body: 'Platform kimlik doğrulama amacıyla JWT token kullanır. Token tarayıcı yerel depolama alanında saklanır. Çerez tabanlı iz bırakma yapılmaz.',
            },
            {
                heading: '5. Verilerinizin Güvenliği',
                body: 'Şifreler güçlü algoritmayla hashlenerek saklanır, düz metin tutulmaz. Kritik admin işlemleri denetim izi (audit log) ile kayıt altına alınır. Loglarda şifre veya tam token saklanmaz.',
            },
            {
                heading: '6. Haklarınız (KVKK / GDPR)',
                body: 'Kişisel Verilerin Korunması Kanunu (KVKK) ve GDPR kapsamında; verilerinize erişim, düzeltme, silme ve işlemeyi kısıtlama haklarına sahipsiniz. Hesabınızı pasife alabilir veya silme talebi için bize ulaşabilirsiniz.',
            },
            {
                heading: '7. Veri Saklama',
                body: 'Hesabınız aktif olduğu sürece verileriniz tutulur. Hesap silinmesi halinde kişisel veriler makul bir süre içinde anonimleştirilir veya silinir. Yasal zorunluluklar nedeniyle bazı kayıtlar daha uzun süre saklanabilir.',
            },
            {
                heading: '8. İletişim',
                body: 'Gizlilik ile ilgili talepleriniz için platform destek kanallarına başvurabilirsiniz.',
            },
        ],
    },
};

export default function Legal() {
    const { page } = useParams();
    const content = CONTENT[page];

    if (!content) {
        return (
            <div style={styles.container}>
                <p>Sayfa bulunamadı.</p>
                <Link to="/" style={styles.back}>Ana sayfaya dön</Link>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <Link to="/" style={styles.back}>← Ana sayfaya dön</Link>
                <h1 style={styles.title}>{content.title}</h1>
                {content.sections.map((s, i) => (
                    <div key={i} style={styles.section}>
                        <h2 style={styles.heading}>{s.heading}</h2>
                        <p style={styles.body}>{s.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 1rem',
    },
    card: {
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '700px',
        width: '100%',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        height: 'fit-content',
    },
    back: {
        display: 'inline-block',
        marginBottom: '1.5rem',
        color: '#F97316',
        textDecoration: 'none',
        fontSize: '14px',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'var(--text-h)',
        marginBottom: '1.5rem',
        fontFamily: 'var(--heading)',
    },
    section: { marginBottom: '1.5rem' },
    heading: {
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--text-h)',
        marginBottom: '0.4rem',
    },
    body: {
        fontSize: '0.9rem',
        color: 'var(--text)',
        lineHeight: 1.6,
    },
};
