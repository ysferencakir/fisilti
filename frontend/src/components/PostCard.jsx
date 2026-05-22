import api from "../api";
import React, { useState } from "react";
import { Repeat2, Pencil, Trash2, Flag, MessageSquare, Heart, Share2 } from "lucide-react";
import { getAnimal, avatarStyle } from "../utils/animals";

const ACCENT = 'var(--accent)';
const ACCENT_BG = 'var(--accent-bg)';

function renderContent(text) {
  return text.split(/(\s+)/).map((word, i) =>
    word.startsWith('#')
      ? <span key={i} style={{ color: ACCENT, fontWeight: 600 }}>{word}</span>
      : word
  );
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return 'şimdi';
  if (diffMin < 60) return `${diffMin}dk`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}sa`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function ActionBtn({ icon: Icon, label, count, active, color, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        background: hovered ? ACCENT_BG : 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: active ? ACCENT : (color || 'var(--text)'),
        fontSize: 14,
        padding: '6px 10px',
        borderRadius: 9999,
        transition: 'background 0.15s',
      }}
    >
      <Icon size={18} strokeWidth={1.75} />
      {count !== undefined && <span>{count}</span>}
    </button>
  );
}

const PostCard = ({ item, currentUser }) => {
  const { type, reposted_by, post } = item;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");

  const handleRepost = async () => {
    try {
      if (post.is_reposted) {
        await api.delete(`/posts/${post.id}/repost/`);
      } else {
        await api.post(`/posts/${post.id}/repost/`);
      }
      window.location.reload();
    } catch (error) {
      console.error("Repost hatası:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu gönderiyi silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/posts/${post.id}/`);
      window.location.reload();
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await api.patch(`/posts/${post.id}/`, { content: editContent });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Düzenleme hatası:", error);
    }
  };

  const handleReportSubmit = async () => {
    try {
      await api.post("/reports/", {
        post: post.id,
        reason: reportReason,
        description: reportDescription,
      });
      alert("Post başarıyla raporlandı.");
      setShowReportModal(false);
      setReportReason("spam");
      setReportDescription("");
    } catch (error) {
      console.error("Raporlama hatası:", error);
      alert("Rapor gönderilirken hata oluştu.");
    }
  };

  const isEdited = new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 1000;
  const isAuthor = currentUser === post.author_username;
  const authorAnimal = getAnimal(post.author_animal_avatar);

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '16px',
      background: 'var(--card-bg)',
      transition: 'background 0.15s',
    }}>
      {/* Repost indicator */}
      {type === "repost" && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text)', marginBottom: 8, marginLeft: 56 }}>
          <Repeat2 size={14} color="var(--accent)" />
          <span>{reposted_by} yeniden fısıldadı</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Avatar */}
        <a href={`/profile/${post.author_username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ ...avatarStyle(post.author_animal_avatar, 44) }}>
            {authorAnimal.emoji}
          </div>
        </a>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <a href={`/profile/${post.author_username}`} style={{ fontWeight: 700, color: 'var(--text-h)', textDecoration: 'none', fontSize: 15 }}>
              {post.author_username}
            </a>
            <span style={{ color: 'var(--text)', fontSize: 14 }}>@{post.author_username}</span>
            <span style={{ color: 'var(--text)', fontSize: 14 }}>·</span>
            <span style={{ color: 'var(--text)', fontSize: 14 }}>{formatTime(post.created_at)}</span>
            {isEdited && <span style={{ color: 'var(--text)', fontSize: 12, opacity: 0.7 }}>(düzenlendi)</span>}
          </div>

          {/* Content */}
          {isEditing ? (
            <div style={{ marginTop: 8 }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={280}
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 8,
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 15,
                  fontFamily: 'var(--sans)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  background: 'var(--bg)',
                  color: 'var(--text-h)',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text)', marginRight: 'auto' }}>{editContent.length}/280</span>
                <button
                  onClick={handleUpdate}
                  style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 9999, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 9999, padding: '6px 16px', cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p style={{ marginTop: 4, fontSize: 15, color: 'var(--text-h)', lineHeight: '1.6', wordBreak: 'break-word' }}>
              {renderContent(post.content)}
            </p>
          )}

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, marginLeft: -10, gap: 0 }}>
            <ActionBtn icon={MessageSquare} label="Yorum" count={0} />
            <ActionBtn
              icon={Repeat2}
              label={post.is_reposted ? "Geri Al" : "Yeniden Paylaş"}
              count={post.repost_count}
              active={post.is_reposted}
              onClick={handleRepost}
            />
            <ActionBtn icon={Heart} label="Beğen" count={0} />
            <ActionBtn icon={Share2} label="Paylaş" />

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 0 }}>
              {isAuthor && (
                <>
                  <ActionBtn icon={Pencil} label="Düzenle" onClick={() => setIsEditing(true)} />
                  <ActionBtn icon={Trash2} label="Sil" color="#EF4444" onClick={handleDelete} />
                </>
              )}
              {!isAuthor && (
                <ActionBtn icon={Flag} label="Raporla" onClick={() => setShowReportModal(true)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 999,
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', color: 'var(--text-h)', padding: 24,
            borderRadius: 16, width: 380, display: 'flex', flexDirection: 'column', gap: 12,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: 'var(--text-h)' }}>Postu Raporla</h3>

            <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h)' }}>Sebep</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)' }}
            >
              <option value="spam">Spam</option>
              <option value="abuse">Taciz / Hakaret</option>
              <option value="inappropriate">Uygunsuz İçerik</option>
              <option value="other">Diğer</option>
            </select>

            <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-h)' }}>Açıklama</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="İsteğe bağlı açıklama yaz..."
              style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', minHeight: 80, fontSize: 14, fontFamily: 'var(--sans)', outline: 'none', background: 'var(--bg)', color: 'var(--text-h)' }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 9999, padding: '8px 16px', cursor: 'pointer', color: 'var(--text)', fontFamily: 'var(--sans)' }}
              >
                İptal
              </button>
              <button
                onClick={handleReportSubmit}
                style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 9999, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
