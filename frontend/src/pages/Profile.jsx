import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserPlus, UserMinus, X, Check } from "lucide-react";
import api, { getFollowers, getFollowing, followUser, unfollowUser } from "../api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { ANIMALS, getAnimal, avatarStyle } from "../utils/animals";

/* ── Hayvan seçici modal ──────────────────────────────────────── */
function AnimalPickerModal({ current, onSelect, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          width: 'min(340px, 90vw)',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-h)' }}>Hayvanını seç</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {Object.values(ANIMALS).map((a) => {
            const selected = current === a.key;
            return (
              <button
                key={a.key}
                onClick={() => onSelect(a.key)}
                style={{
                  border: selected ? `2px solid ${a.color}` : '2px solid var(--border)',
                  borderRadius: 14,
                  padding: '16px 12px',
                  background: selected ? a.color + '18' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
              >
                {selected && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 18, height: 18, borderRadius: '50%',
                    background: a.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={11} color="white" />
                  </div>
                )}
                <span style={{ fontSize: 36 }}>{a.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: selected ? a.color : 'var(--text-h)' }}>
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Takipçi / Takip listesi modal ───────────────────────────── */
function UserListModal({ title, users, loading, onClose }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%', maxWidth: 380, maxHeight: '70vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-h)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <p style={{ padding: 20, color: 'var(--text)', textAlign: 'center', fontSize: 14 }}>Yükleniyor…</p>
          ) : users.length === 0 ? (
            <p style={{ padding: 20, color: 'var(--text)', textAlign: 'center', fontSize: 14 }}>Henüz kimse yok.</p>
          ) : (
            users.map((u) => {
              const name = u.username;
              const animal = getAnimal(u.animal_avatar);
              return (
                <div
                  key={name}
                  onClick={() => { onClose(); navigate(`/profile/${name}`); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ ...avatarStyle(u.animal_avatar, 40), flexShrink: 0 }}>
                    {animal.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h)' }}>{name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text)' }}>@{name}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Ana Profile bileşeni ─────────────────────────────────────── */
const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, login } = useAuth();

  const [profile, setProfile] = useState(null);
  const [feed, setFeed] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [userListModal, setUserListModal] = useState(null); // null | 'followers' | 'following'
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    setProfile(null);
    setFeed([]);
    fetchProfile();
    fetchFeed();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${username}/`);
      setProfile(data);
    } catch (err) {
      console.error("Profil alınamadı:", err);
    }
  };

  const fetchFeed = async () => {
    try {
      const [postsRes, repostsRes] = await Promise.all([
        api.get(`/posts/user/${username}/`),
        api.get(`/posts/user/${username}/reposts/`),
      ]);
      const posts = postsRes.data.map((post) => ({
        type: "post", reposted_by: null, reposted_at: null, post,
        _sortDate: new Date(post.created_at).getTime(),
      }));
      const reposts = repostsRes.data.map((item) => ({
        ...item, _sortDate: new Date(item.reposted_at || item.post?.created_at).getTime(),
      }));
      setFeed([...posts, ...reposts].sort((a, b) => b._sortDate - a._sortDate));
    } catch (err) {
      console.error("Feed alınamadı:", err);
    }
  };

  const openUserList = async (type) => {
    setUserListModal(type);
    setModalUsers([]);
    setModalLoading(true);
    try {
      const { data } = type === 'followers'
        ? await getFollowers(username)
        : await getFollowing(username);
      setModalUsers(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      console.error("Liste alınamadı:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(username);
        setProfile(p => ({ ...p, is_following: false, followers_count: (p.followers_count ?? 1) - 1 }));
      } else {
        await followUser(username);
        setProfile(p => ({ ...p, is_following: true, followers_count: (p.followers_count ?? 0) + 1 }));
      }
    } catch (err) {
      console.error("Takip hatası:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAnimalSelect = async (animalKey) => {
    try {
      await api.patch('/users/me/', { animal_avatar: animalKey });
      setProfile(p => ({ ...p, animal_avatar: animalKey }));
      setShowAnimalPicker(false);
      // AuthContext'teki user bilgisini de güncelle (sayfayı yenilemeye gerek kalmasın)
      window.dispatchEvent(new CustomEvent('avatar-changed', { detail: animalKey }));
    } catch (err) {
      console.error("Hayvan güncellenemedi:", err);
    }
  };

  const animal = getAnimal(profile?.animal_avatar);
  const initial = username?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
      {/* Sticky başlık */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0,
        background: 'var(--bg)',
        backdropFilter: 'blur(8px)', zIndex: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-h)' }}>
          @{username}
        </h1>
      </div>

      {/* Profil kartı */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          {/* Avatar — kendi profilinde tıklanabilir */}
          <div
            onClick={isOwnProfile ? () => setShowAnimalPicker(true) : undefined}
            title={isOwnProfile ? 'Hayvanını değiştir' : undefined}
            style={{
              ...avatarStyle(profile?.animal_avatar, 64),
              cursor: isOwnProfile ? 'pointer' : 'default',
              position: 'relative',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={isOwnProfile ? e => { e.currentTarget.style.opacity = '0.8'; } : undefined}
            onMouseLeave={isOwnProfile ? e => { e.currentTarget.style.opacity = '1'; } : undefined}
          >
            {profile ? animal.emoji : initial}
            {isOwnProfile && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--card-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10,
              }}>
                ✏️
              </div>
            )}
          </div>

          {/* Takip butonu */}
          {!isOwnProfile && currentUser && (
            <button
              onClick={handleFollow}
              disabled={followLoading || !profile}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 9999,
                border: profile?.is_following ? '1px solid var(--border)' : 'none',
                background: profile?.is_following ? 'transparent' : 'var(--accent)',
                color: profile?.is_following ? 'var(--text-h)' : 'white',
                fontWeight: 700, fontSize: 14,
                cursor: (followLoading || !profile) ? 'not-allowed' : 'pointer',
                opacity: (followLoading || !profile) ? 0.65 : 1,
                fontFamily: 'var(--sans)', transition: 'opacity 0.15s',
              }}
            >
              {profile?.is_following
                ? <><UserMinus size={15} /> Takipten Çık</>
                : <><UserPlus size={15} /> Takip Et</>
              }
            </button>
          )}
        </div>

        {/* Kullanıcı adı */}
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-h)', marginBottom: 4 }}>
          @{username}
          {profile && (
            <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, color: 'var(--text)' }}>
              {animal.emoji} {animal.label}
            </span>
          )}
        </div>

        {/* Takipçi / Takip — tıklanabilir */}
        {profile ? (
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <button onClick={() => openUserList('followers')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, color: 'var(--text)', fontFamily: 'var(--sans)' }}>
              <strong style={{ color: 'var(--text-h)' }}>{profile.followers_count ?? 0}</strong> takipçi
            </button>
            <button onClick={() => openUserList('following')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14, color: 'var(--text)', fontFamily: 'var(--sans)' }}>
              <strong style={{ color: 'var(--text-h)' }}>{profile.following_count ?? 0}</strong> takip
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 10 }}>Yükleniyor…</div>
        )}

        {/* Kendi profili: Hesabı deaktive et */}
        {isOwnProfile && (
          <button
            onClick={() => {
              if (!window.confirm('Hesabınız deaktive edilecek. Emin misiniz?')) return;
              api.delete('/users/me/').then(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
              }).catch(err => alert('Deaktivation hata: ' + err.message));
            }}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'var(--sans)',
              fontWeight: 500
            }}
          >
            Hesabı Deaktive Et
          </button>
        )}
      </div>

      {/* Feed */}
      {feed.length === 0 ? (
        <p style={{ padding: 20, color: 'var(--text)' }}>Henüz gönderi yok.</p>
      ) : (
        feed.map((item, i) => (
          <PostCard
            key={item.type === 'post' ? `post-${item.post.id}` : `repost-${i}`}
            item={item}
            currentUser={currentUser?.username}
          />
        ))
      )}

      {/* Hayvan seçici */}
      {showAnimalPicker && (
        <AnimalPickerModal
          current={profile?.animal_avatar || 'fox'}
          onSelect={handleAnimalSelect}
          onClose={() => setShowAnimalPicker(false)}
        />
      )}

      {/* Kullanıcı listesi */}
      {userListModal && (
        <UserListModal
          title={userListModal === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}
          users={modalUsers}
          loading={modalLoading}
          onClose={() => setUserListModal(null)}
        />
      )}
    </div>
  );
};

export default Profile;
