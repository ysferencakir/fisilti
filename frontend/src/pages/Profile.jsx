import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const { username } = useParams();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("posts");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, [username, activeTab]);

    const getResults = (data) => {
        return Array.isArray(data) ? data : data.results || [];
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const profileResponse = await api.get(`/users/${username}/`);
            setProfile(profileResponse.data);

            const postsUrl =
                activeTab === "posts"
                    ? `/posts/user/${username}/`
                    : `/posts/user/${username}/reposts/`;

            try {
                const postsResponse = await api.get(postsUrl);
                setPosts(getResults(postsResponse.data));
            } catch (postErr) {
                if (activeTab === "reposts") {
                    setPosts([]);
                } else {
                    throw postErr;
                }
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError("Kullanıcı bulunamadı.");
            } else {
                setError("Kullanıcı bilgileri yüklenemedi.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            await api.post(`/${username}/follow/`);

            setProfile((prev) => ({
                ...prev,
                is_following: true,
                followers_count: prev.followers_count + 1,
            }));
        } catch (err) {
            alert("Takip işlemi başarısız oldu.");
        }
    };

    const handleUnfollow = async () => {
        try {
            await api.delete(`/${username}/follow/`);

            setProfile((prev) => ({
                ...prev,
                is_following: false,
                followers_count: prev.followers_count - 1,
            }));
        } catch (err) {
            alert("Takipten çıkma işlemi başarısız oldu.");
        }
    };

    if (loading) {
        return <div style={{ padding: "2rem" }}>Yükleniyor...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>
                {error}
            </div>
        );
    }

    const isOwnProfile = user?.username === profile.username;

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "2rem auto",
                padding: "1rem",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    backgroundColor: "white",
                    textAlign: "center",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                <h2>@{profile.username}</h2>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1.5rem",
                        margin: "1rem 0",
                        flexWrap: "wrap",
                    }}
                >
                    <span>
                        <strong>{profile.followers_count}</strong> takipçi
                    </span>
                    <span>
                        <strong>{profile.following_count}</strong> takip edilen
                    </span>
                </div>

                {isOwnProfile ? (
                    <button>Hesabı Pasife Al</button>
                ) : profile.is_following ? (
                    <button onClick={handleUnfollow}>Takipten Çık</button>
                ) : (
                    <button onClick={handleFollow}>Takip Et</button>
                )}
            </div>

            <div
                style={{
                    marginTop: "2rem",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                }}
            >
                <button onClick={() => setActiveTab("posts")}>
                    Gönderiler
                </button>

                <button onClick={() => setActiveTab("reposts")}>
                    Repostlar
                </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                {posts.length === 0 ? (
                    <p style={{ textAlign: "center" }}>
                        Bu sekmede gönderi yok.
                    </p>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            item={post.post ? post : { type: "post", post }}
                            currentUser={user?.username}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default Profile;