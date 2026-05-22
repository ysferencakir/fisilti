import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";

const Profile = () => {
  const { username } = useParams();

  const [posts, setPosts] = useState([]);
  const [reposts, setReposts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    fetchPosts();
    fetchReposts();
  }, [username]);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get(`/posts/user/${username}/`);
      setPosts(data);
    } catch (error) {
      console.error("Postlar alınamadı:", error);
    }
  };

  const fetchReposts = async () => {
    try {
      const { data } = await api.get(`/posts/user/${username}/reposts/`);
      setReposts(data);
    } catch (error) {
      console.error("Repostlar alınamadı:", error);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto" }}>
      <h2>@{username}</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button onClick={() => setActiveTab("posts")}>
          Gönderiler
        </button>

        <button onClick={() => setActiveTab("reposts")}>
          Repostlar
        </button>
      </div>

      {activeTab === "posts" &&
        posts.map((item) => (
          <PostCard
            key={item.id}
            item={{
              type: "post",
              reposted_by: null,
              reposted_at: null,
              post: item,
            }}
          />
        ))}

      {activeTab === "reposts" &&
        reposts.map((item, index) => (
          <PostCard
            key={index}
            item={item}
          />
        ))}
    </div>
  );
};

export default Profile;
