import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchUsers, followUser, unfollowUser } from '../api/index';
import { useAuth } from '../context/AuthContext';
import './Search.css';

export default function Search() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
      setSearchParams({ q: query });
    } else {
      setResults([]);
      setSearchParams({});
    }
  }, []);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await searchUsers(searchTerm);
      setResults(res.data);

      // Takip durumunu kontrol et
      const following = {};
      res.data.forEach(u => {
        following[u.username] = u.is_followed_by_me;
      });
      setFollowingMap(following);
    } catch (err) {
      setError('Arama yapılırken hata oluştu. Lütfen tekrar deneyin.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
    setSearchParams({ q: query });
  };

  const handleFollow = async (username, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(username);
      } else {
        await followUser(username);
      }
      setFollowingMap(prev => ({
        ...prev,
        [username]: !prev[username]
      }));
    } catch (err) {
      console.error('Follow error:', err);
      setError('İşlem başarısız oldu.');
    }
  };

  const getAvatarEmoji = (animal) => {
    const avatars = {
      fox: '🦊',
      owl: '🦉',
      rabbit: '🐰',
      cat: '🐱'
    };
    return avatars[animal] || '👤';
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Kullanıcı adı veya isim ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {query.trim() && (
          <div className="search-results">
            {loading && (
              <div className="loading">Aranıyor...</div>
            )}

            {!loading && results.length === 0 && (
              <div className="no-results">
                <p>"{query}" için sonuç bulunamadı</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <>
                <div className="results-header">
                  <h3>{results.length} kullanıcı bulundu</h3>
                </div>
                <div className="results-list">
                  {results.map(searchUser => (
                    <div key={searchUser.username} className="user-card">
                      <div className="user-card-header">
                        <Link
                          to={`/profile/${searchUser.username}`}
                          className="user-avatar-link"
                        >
                          <span className="user-avatar">
                            {getAvatarEmoji(searchUser.animal_avatar)}
                          </span>
                        </Link>
                        <div className="user-info">
                          <Link
                            to={`/profile/${searchUser.username}`}
                            className="user-name-link"
                          >
                            <h4 className="user-full-name">{searchUser.full_name}</h4>
                            <p className="user-username">@{searchUser.username}</p>
                          </Link>
                        </div>
                      </div>

                      {user?.username !== searchUser.username && (
                        <button
                          className={`follow-btn ${followingMap[searchUser.username] ? 'following' : ''}`}
                          onClick={() => handleFollow(searchUser.username, followingMap[searchUser.username])}
                        >
                          {followingMap[searchUser.username] ? 'Takipten Çık' : 'Takip Et'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="search-hint">
            <p>👥 Kullanıcı aramaya başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
}
