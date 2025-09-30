// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import "./Profile.css";
import { FiVideo, FiTag, FiBookmark } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="Arial" font-size="18">Image not available</text></svg>';

function ImageWithFallback({ src, alt, className, style }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => {
        if (imgSrc !== FALLBACK_SVG) setImgSrc(FALLBACK_SVG);
      }}
    />
  );
}

const Profile = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState({});

  // Get logged-in user info
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  // Fetch posts of the logged-in user
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/posts?user_id=${userId}`);
        const data = await res.json();
        if (Array.isArray(data.posts)) {
          const grouped = data.posts.reduce((acc, item) => {
            const postId = item.post_id;
            if (!acc[postId]) acc[postId] = { ...item, media: [] };
            if (item.media_id) acc[postId].media.push(item);
            return acc;
          }, {});
          setUserPosts(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to fetch user posts", err);
      }
    };
    fetchUserPosts();
  }, [userId]);

  const handlePrev = (postId) => {
    setCarouselIndex((prev) => {
      const current = prev[postId] || 0;
      const length = userPosts.find((p) => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (current - 1 + length) % length };
    });
  };

  const handleNext = (postId) => {
    setCarouselIndex((prev) => {
      const current = prev[postId] || 0;
      const length = userPosts.find((p) => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (current + 1) % length };
    });
  };

  return (
    <div className="profile-container">
      {/* User Info Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <ImageWithFallback
              src={user?.avatar || "https://i.pravatar.cc/80?img=32"}
              alt="avatar"
              style={{ width: 80, height: 80, borderRadius: "50%" }}
            />
          </div>
          <div className="profile-info">
            <h2>
              {user?.name || "Anonymous"} <span className="username">@{user?.username || "user"}</span>
            </h2>
            <div className="badges">
              <span className="badge">{user?.location || "Unknown"}</span>
              <span className="badge">{userPosts.length} Posts</span>
            </div>
          </div>
          <button className="menu-btn" aria-label="menu">☰</button>
        </div>

        <p className="bio">{user?.bio || "No bio yet."}</p>

        <div className="profile-stats">
          <div><strong>{userPosts.length}</strong><span>posts</span></div>
          <div><strong>{user?.followers || 0}</strong><span>followers</span></div>
          <div><strong>{user?.following || 0}</strong><span>following</span></div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn">Edit profile</button>
          <button className="share-btn" aria-label="share">⤴</button>
        </div>
      </div>

      {/* Points Section */}
      <div className="points-card">
        <div className="points-stamps">
          <div className="stamp">🎟️</div>
          <div className="stamp">🎟️</div>
          <div className="stamp">🎟️</div>
          <div className="stamp">🎟️</div>
        </div>
        <button className="view-btn">View Points</button>
      </div>

      {/* Icons row */}
      <div className="points-actions">
        <button className="icon-btn" aria-label="video">
          <FiVideo size={22} />
          <span className="icon-label">Video</span>
        </button>
        <button className="icon-btn" aria-label="tagged">
          <FiTag size={22} />
          <span className="icon-label">Tagged</span>
        </button>
        <button className="icon-btn" aria-label="saved">
          <FiBookmark size={22} />
          <span className="icon-label">Saved</span>
        </button>
      </div>

      {/* User Posts Grid */}
      <div className="posts-grid">
        {userPosts.length === 0 && <p>No posts yet.</p>}
        {userPosts.map((p) => (
          <div key={p.post_id} className="post-card">
            <h3>{p.post_name}</h3>
            {p.media.length > 0 && (
              <div className="carousel">
                {p.media.length > 1 && (
                  <button className="carousel-btn left" onClick={() => handlePrev(p.post_id)}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}

                {(() => {
                  const currentIdx = carouselIndex[p.post_id] || 0;
                  const media = p.media[currentIdx];
                  if (!media) return null;
                  return media.type === "image" ? (
                    <img
                      src={`data:image/*;base64,${media.data}`}
                      alt={media.filename || `post-${p.post_id}`}
                      className="post-media"
                    />
                  ) : (
                    <video
                      controls
                      src={`data:video/*;base64,${media.data}`}
                      className="post-media"
                    />
                  );
                })()}

                {p.media.length > 1 && (
                  <button className="carousel-btn right" onClick={() => handleNext(p.post_id)}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                )}

                {p.media.length > 1 && (
                  <div className="carousel-dots">
                    {p.media.map((_, idx) => (
                      <span
                        key={idx}
                        className={`dot ${carouselIndex[p.post_id] === idx ? "active" : ""}`}
                        onClick={() =>
                          setCarouselIndex((prev) => ({ ...prev, [p.post_id]: idx }))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <p>Location: {p.location || "N/A"}</p>
            <p>Tags: {p.tags || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
