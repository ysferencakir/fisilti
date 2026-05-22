import api from "../api";
import React, { useState } from "react";

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
  const confirmDelete = window.confirm(
    "Bu gönderiyi silmek istediğine emin misin?"
  );

  if (!confirmDelete) return;

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
    await api.patch(`/posts/${post.id}/`, {
      content: editContent,
    });

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
const buttonStyle = {
  border: "none",
  borderRadius: "20px",
  padding: "8px 14px",
  cursor: "pointer",
  backgroundColor: "#f3f4f6",
};
  return (
    <div
     style={{
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "18px",
  marginBottom: "16px",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
}}
    >
      {type === "repost" && (
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "10px",
          }}
        >
          🔁 {reposted_by} yeniden paylaştı
        </p>
      )}

      <h3>
        <a href={`/profile/${post.author_username}`}>
          {post.author_username}
        </a>
      </h3>

     {isEditing ? (
  <div>
    <textarea
      value={editContent}
      onChange={(e) => setEditContent(e.target.value)}
      maxLength={280}
      style={{
        width: "100%",
        minHeight: "80px",
        padding: "8px",
      }}
    />

    <p>{editContent.length}/280</p>

    <button onClick={handleUpdate}>Kaydet</button>

    <button onClick={() => setIsEditing(false)}>
      İptal
    </button>
  </div>
) : (
  <p>{post.content}</p>
)}

      <small>
  {new Date(post.updated_at).getTime() - new Date(post.created_at).getTime() > 1000 && (
  <span style={{ marginLeft: "8px", color: "#777" }}>
    (düzenlendi)
  </span>
)}
</small>

      <div
       style={{
  marginTop: "14px",
  display: "flex",
  gap: "10px",
  alignItems: "center",
}}
      >
       <button style={buttonStyle} onClick={handleRepost}>
  {post.is_reposted ? "🔄" : "🔁"} {post.repost_count}
</button>

        {currentUser === post.author_username && (
          <>
            <button style={buttonStyle} onClick={() => setIsEditing(true)}>
  Düzenle
</button>
            <button style={buttonStyle} onClick={handleDelete}>Sil</button>
          </>
        )}

        {currentUser !== post.author_username && (
          <button style={buttonStyle} onClick={() => setShowReportModal(true)}> Raporla
</button>
        )}
        {showReportModal && (
  <div style={modalOverlayStyle}>
    <div style={modalStyle}>
      <h3>Postu Raporla</h3>

      <label>Sebep</label>
      <select
        value={reportReason}
        onChange={(e) => setReportReason(e.target.value)}
        style={inputStyle}
      >
        <option value="spam">Spam</option>
        <option value="abuse">Taciz / Hakaret</option>
        <option value="inappropriate">Uygunsuz İçerik</option>
        <option value="other">Diğer</option>
      </select>

      <label>Açıklama</label>
      <textarea
        value={reportDescription}
        onChange={(e) => setReportDescription(e.target.value)}
        placeholder="İsteğe bağlı açıklama yaz..."
        style={textareaStyle}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
        <button style={buttonStyle} onClick={handleReportSubmit}>
          Gönder
        </button>

        <button style={buttonStyle} onClick={() => setShowReportModal(false)}>
          İptal
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalStyle = {
  backgroundColor: "#fff",
  color: "#000",
  padding: "20px",
  borderRadius: "12px",
  width: "350px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const textareaStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  minHeight: "80px",
};
export default PostCard;