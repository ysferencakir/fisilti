import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  const currentUser = "gorkem"; // sonra login sisteminden gelecek

  const fetchFeed = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/posts/feed/");
      const data = await response.json();
      setPosts(data.results || data);
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
      await fetch("http://localhost:8000/api/posts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      setContent("");
      fetchFeed();
    } catch (error) {
      console.error("Gönderi paylaşılamadı:", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
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
        posts.map((item, index) => (
          <PostCard key={index} item={item} currentUser={currentUser} />
        ))
      )}
    </div>
  );
};

export default Home;