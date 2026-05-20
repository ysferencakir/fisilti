import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const auth = useAuth();

    const [currentUser, setCurrentUser] = useState(auth?.user || null);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("posts");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, [username, activeTab]);

    const getResults = (data) => {
        return Array.isArray(data) ? data : data?.results || [];
    };

    const loadCurrentUser = async () => {
        if (auth?.user) {
            setCurrentUser(auth.user);
            return auth.user;
        }

        try {
            const response = await api.get("/users/me/");
            setCurrentUser(response.data);
            return response.data;
        } catch {
            setCurrentUser(null);
            return null;
        }
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const current = await loadCurrentUser();

            const profileResponse = await api.get(`/users/${username}/`);
            const profileData = profileResponse.data;

            if (
                profileData?.is_banned ||
                profileData?.is_suspended ||
                profileData?.is_active === false
            ) {
                setError("Bu hesap askıya alınmıştır.");
                return;
            }

            setProfile(profileData);

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
            const detail = err.response?.data?.detail || "";

            if (
                err.response?.status === 403 ||
                detail.toLowerCase().includes("ban") ||
                detail.toLowerCase().includes("suspend") ||
                detail.toLowerCase().includes("askıya")
            ) {
                setError("Bu hesap askıya alınmıştır.");
            } else if (err.response?.status === 404) {
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

            if (typeof auth?.logout === "function") {
                auth.logout();
            }

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("user");

            navigate("/login");
        } catch {
            alert("Hesap pasife alınamadı.");
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            background:
                "linear-gradient(135deg, #020617 0%, #111827 40%, #1e1b4b 100%)",
            padding: "2rem 1rem",
            boxSizing: "border-box",
        },
        container: {
            maxWidth: "780px",
            margin: "0 auto",
            width: "100%",
        },
        card: {
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "28px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
        },
        avatar: {
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            margin: "0 auto 1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            fontWeight: "800",
            color: "white",
            background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
            boxShadow: "0 15px 40px rgba(124,58,237,0.5)",
        },
        username: {
            margin: 0,
            fontSize: "2rem",
            color: "#F8FAFC",
            fontWeight: "800",
        },
        subtitle: {
            marginTop: "0.5rem",
            color: "#CBD5E1",
            fontSize: "0.95rem",
        },
        stats: {
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            margin: "2rem 0",
            flexWrap: "wrap",
        },
        statBox: {
            minWidth: "140px",
            padding: "1rem",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
        },
        statNumber: {
            display: "block",
            fontSize: "1.5rem",
            fontWeight: "800",
            color: "#F8FAFC",
        },
        statLabel: {
            display: "block",
            marginTop: "0.25rem",
            color: "#CBD5E1",
            fontSize: "0.9rem",
        },
        primaryButton: {
            border: "none",
            borderRadius: "999px",
            padding: "0.9rem 1.7rem",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: "pointer",
            color: "white",
            background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
            boxShadow: "0 12px 28px rgba(124,58,237,0.35)",
        },
        secondaryButton: {
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "999px",
            padding: "0.9rem 1.7rem",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: "pointer",
            color: "#F8FAFC",
            background: "rgba(255,255,255,0.06)",
        },
        dangerButton: {
            border: "none",
            borderRadius: "999px",
            padding: "0.9rem 1.7rem",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: "pointer",
            color: "white",
            background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
            boxShadow: "0 12px 28px rgba(239,68,68,0.3)",
        },
        tabs: {
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
        },
        tabButton: (active) => ({
            border: active ? "none" : "1px solid rgba(255,255,255,0.12)",
            borderRadius: "999px",
            padding: "0.85rem 1.5rem",
            fontWeight: "700",
            fontSize: "0.95rem",
            cursor: "pointer",
            color: active ? "white" : "#CBD5E1",
            background: active
                ? "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)"
                : "rgba(255,255,255,0.06)",
            boxShadow: active ? "0 12px 28px rgba(124,58,237,0.3)" : "none",
        }),
        content: {
            marginTop: "1.8rem",
        },
        empty: {
            background: "rgba(255,255,255,0.06)",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: "24px",
            padding: "2.5rem",
            textAlign: "center",
            color: "#CBD5E1",
        },
        loading: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#020617",
            color: "#F8FAFC",
            fontWeight: "700",
            fontSize: "1.2rem",
        },
        error: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#020617",
            color: "#ef4444",
            fontWeight: "700",
            fontSize: "1.1rem",
            textAlign: "center",
            padding: "2rem",
        },
    };

    if (loading) {
        return <div style={styles.loading}>Profil yükleniyor...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    const isOwnProfile =
        currentUser?.username === profile?.username ||
        auth?.user?.username === profile?.username;

    const firstLetter = profile?.username?.charAt(0)?.toUpperCase() || "F";

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.avatar}>{firstLetter}</div>

                    <h2 style={styles.username}>@{profile.username}</h2>

                    <p style={styles.subtitle}>
                        Fısıltı topluluğunda aktif kullanıcı
                    </p>

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
                                currentUser={
                                    currentUser?.username || auth?.user?.username
                                }
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;

