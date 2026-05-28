import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { getAnimal, avatarStyle } from "../utils/animals";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const { user } = useAuth();

  const fetchFeed = async () => {
    try {
      const response = await api.get("/posts/feed/");
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error("Feed alınamadı:", error);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post("/posts/", { content });
      setContent("");
      fetchFeed();
    } catch (error) {
      console.error("Gönderi paylaşılamadı:", error);
    }
  };

  const myAnimal = getAnimal(user?.animal_avatar);
  const charColor = content.length > 250 ? '#EF4444' : 'var(--text)';

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-h)' }}>
          Ana Sayfa
        </h1>
      </div>

      {/* Post Composer */}
      <form onSubmit={handleSubmit} style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--card-bg)',
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Avatar */}
          <div style={{ ...avatarStyle(user?.animal_avatar, 44) }}>
            {myAnimal.emoji}
          </div>

          <div style={{ flex: 1 }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              placeholder="Ne fısıldıyorsun?"
              style={{
                width: '100%',
                minHeight: 80,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 17,
                color: 'var(--text-h)',
                resize: 'none',
                fontFamily: 'var(--sans)',
                boxSizing: 'border-box',
              }}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: charColor }}>
                {content.length}/280
              </span>
              <button
                type="submit"
                disabled={!content.trim()}
                style={{
                  background: content.trim() ? 'var(--accent)' : 'var(--accent-border)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '8px 22px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: content.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--sans)',
                }}
              >
                Fısılda
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Feed */}
      {posts.length === 0 ? (
        <p style={{ padding: 20, color: 'var(--text)' }}>Henüz gönderi yok.</p>
      ) : (
        posts.map((item) => (
          <PostCard key={item.post.id} item={item} currentUser={user?.username} />
        ))
      )}
    </div>
  );
};

export default Home;
