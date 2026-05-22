import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const { user } = useAuth();

  const fetchFeed = async () => {
    try {
      const response = await api.get("/posts/feed/")
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

  return (
    <div
  style={{
    maxWidth: "650px",
    margin: "40px auto",
    padding: "0 16px",
  }}
>
      <h2>Ana Sayfa</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={280}
          placeholder="Ne düşünüyorsun?"
          style={{ width: "100%", minHeight: "80px", padding: "10px" }}
        />

        <p>{content.length}/280</p>

        <button type="submit">Paylaş</button>
      </form>

      <hr />

      {posts.length === 0 ? (
        <p>Henüz gönderi yok.</p>
      ) : (
        posts.map((item) => (
          <PostCard key={item.post.id} item={item} currentUser={user?.username} />
        ))
      )}
    </div>
  );
};

export default Home;