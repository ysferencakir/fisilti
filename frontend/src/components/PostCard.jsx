import React from "react";

const PostCard = ({ item, currentUser }) => {
  const { type, reposted_by, post } = item;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "15px",
        backgroundColor: "#fff",
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

      <h3>{post.author_username}</h3>

      <p>{post.content}</p>

      <small>
        {new Date(post.created_at).toLocaleString("tr-TR")}
      </small>

      <div
        style={{
          marginTop: "10px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button>
          🔁 {post.repost_count}
        </button>

        {currentUser === post.author_username && (
          <>
            <button>Düzenle</button>
            <button>Sil</button>
          </>
        )}

        {currentUser !== post.author_username && (
          <button>Raporla</button>
        )}
      </div>
    </div>
  );
};

export default PostCard;