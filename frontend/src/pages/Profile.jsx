import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
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
        } catch {
            alert("Takip işlemi başarısız oldu.");
        }
    };

    const handleUnfollow = async () => {
        try {
            await api.delete(`/${username}/follow/`);

            setProfile((prev) => ({
                ...prev,
                is_following: false,
                followers_count: Math.max(prev.followers_count - 1, 0),
            }));
        } catch {
            alert("Takipten çıkma işlemi başarısız oldu.");
        }
    };

    const handleDeactivateAccount = async () => {
        const confirmed = window.confirm(
            "Hesabınızı pasife almak istediğinize emin misiniz?"
        );

        if (!confirmed) return;

        try {
            await api.delete("/users/me/");

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            navigate("/login");
        } catch {
            alert("Hesap pasife alınamadı.");
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f4f0ff 0%, #fff7fb 45%, #f7fbff 100%)",
            padding: "2rem 1rem",
            boxSizing: "border-box",
        },
        container: {
            maxWidth: "780px",
            margin: "0 auto",
            width: "100%",
        },
        card: {
            background: "rgba(255, 255, 255, 0.92)",
            border: "1px solid rgba(124, 58, 237, 0.14)",
            borderRadius: "24px",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(88, 28, 135, 0.12)",
            backdropFilter: "blur(12px)",
        },
        avatar: {
            width: "92px",
            height: "92px",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.4rem",
            fontWeight: "800",
            color: "white",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            boxShadow: "0 12px 30px rgba(124, 58, 237, 0.35)",
        },
        username: {
            margin: "0",
            fontSize: "1.8rem",
            color: "#1f2937",
        },
        subtitle: {
            marginTop: "0.4rem",
            color: "#6b7280",
            fontSize: "0.95rem",
        },
        stats: {
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            margin: "1.5rem 0",
            flexWrap: "wrap",
        },
        statBox: {
            minWidth: "130px",
            padding: "0.9rem 1rem",
            borderRadius: "18px",
            background: "#f8f5ff",
            border: "1px solid #ede9fe",
        },
        statNumber: {
            display: "block",
            fontSize: "1.35rem",
            fontWeight: "800",
            color: "#5b21b6",
        },
        statLabel: {
            display: "block",
            marginTop: "0.2rem",
            color: "#6b7280",
            fontSize: "0.9rem",
        },
        primaryButton: {
            border: "none",
            borderRadius: "999px",
            padding: "0.8rem 1.5rem",
            fontWeight: "700",
            cursor: "pointer",
            color: "white",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            boxShadow: "0 12px 24px rgba(124, 58, 237, 0.25)",
        },
        secondaryButton: {
            border: "1px solid #ddd6fe",
            borderRadius: "999px",
            padding: "0.8rem 1.5rem",
            fontWeight: "700",
            cursor: "pointer",
            color: "#5b21b6",
            background: "#ffffff",
        },
        dangerButton: {
            border: "none",
            borderRadius: "999px",
            padding: "0.8rem 1.5rem",
            fontWeight: "700",
            cursor: "pointer",
            color: "white",
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            boxShadow: "0 12px 24px rgba(239, 68, 68, 0.22)",
        },
        tabs: {
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.8rem",
            flexWrap: "wrap",
        },
        tabButton: (active) => ({
            border: active ? "none" : "1px solid #ddd6fe",
            borderRadius: "999px",
            padding: "0.75rem 1.3rem",
            fontWeight: "700",
            cursor: "pointer",
            color: active ? "white" : "#6d28d9",
            background: active
                ? "linear-gradient(135deg, #7c3aed, #ec4899)"
                : "rgba(255, 255, 255, 0.85)",
            boxShadow: active ? "0 10px 22px rgba(124, 58, 237, 0.22)" : "none",
        }),
        content: {
            marginTop: "1.5rem",
        },
        empty: {
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            textAlign: "center",
            color: "#6b7280",
            border: "1px dashed #c4b5fd",
        },
        loading: {
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6d28d9",
            fontWeight: "700",
            fontSize: "1.1rem",
        },
        error: {
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dc2626",
            fontWeight: "700",
            fontSize: "1.1rem",
            textAlign: "center",
        },
    };

    if (loading) {
        return <div style={styles.loading}>Profil yükleniyor...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    const isOwnProfile = user?.username === profile.username;
    const firstLetter = profile.username?.charAt(0)?.toUpperCase() || "F";

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.avatar}>{firstLetter}</div>

                    <h2 style={styles.username}>@{profile.username}</h2>
                    <p style={styles.subtitle}>Fısıltı profili</p>

                    <div style={styles.stats}>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>
                                {profile.followers_count}
                            </span>
                            <span style={styles.statLabel}>Takipçi</span>
                        </div>

                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>
                                {profile.following_count}
                            </span>
                            <span style={styles.statLabel}>Takip edilen</span>
                        </div>
                    </div>

                    {isOwnProfile ? (
                        <button
                            style={styles.dangerButton}
                            onClick={handleDeactivateAccount}
                        >
                            Hesabı Pasife Al
                        </button>
                    ) : profile.is_following ? (
                        <button
                            style={styles.secondaryButton}
                            onClick={handleUnfollow}
                        >
                            Takipten Çık
                        </button>
                    ) : (
                        <button
                            style={styles.primaryButton}
                            onClick={handleFollow}
                        >
                            Takip Et
                        </button>
                    )}
                </div>

                <div style={styles.tabs}>
                    <button
                        style={styles.tabButton(activeTab === "posts")}
                        onClick={() => setActiveTab("posts")}
                    >
                        Gönderiler
                    </button>

                    <button
                        style={styles.tabButton(activeTab === "reposts")}
                        onClick={() => setActiveTab("reposts")}
                    >
                        Repostlar
                    </button>
                </div>

                <div style={styles.content}>
                    {posts.length === 0 ? (
                        <div style={styles.empty}>
                            <h3 style={{ marginTop: 0 }}>
                                Bu sekmede gönderi yok.
                            </h3>
                            <p style={{ marginBottom: 0 }}>
                                Kullanıcı paylaşım yaptığında burada görünecek.
                            </p>
                        </div>
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
        </div>
    );
}

export default Profile;