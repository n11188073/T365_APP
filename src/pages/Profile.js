import React from "react";
import "./Profile.css";
import { FiVideo, FiTag, FiBookmark } from "react-icons/fi";

const FALLBACK_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="Arial" font-size="18">Image not available</text></svg>';

function ImageWithFallback({ src, alt, className, style }) {
  const [imgSrc, setImgSrc] = React.useState(src);
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
  const photos = [
    "https://picsum.photos/id/49/600/600",
    "https://picsum.photos/id/84/600/600",
    "https://picsum.photos/id/213/600/600",
    "https://picsum.photos/id/215/600/600",
    "https://picsum.photos/id/249/600/600",
    "https://picsum.photos/id/1035/600/600",
  ];

  return (
    <div className="profile-container">
      {/* User Info Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <ImageWithFallback
              src="https://i.pravatar.cc/80?img=32"
              alt="avatar"
              style={{ width: 80, height: 80, borderRadius: "50%" }}
            />
          </div>
          <div className="profile-info">
            <h2>
              Jane Doe <span className="username">@janedoe101</span>
            </h2>
            <div className="badges">
              <span className="badge">Gold Coast</span>
              <span className="badge">12 Trips</span>
            </div>
          </div>
          <button className="menu-btn" aria-label="menu">☰</button>
        </div>

        <p className="bio">
          I love travelling with my family, follow along to see my travel experiences
        </p>

        <div className="profile-stats">
          <div><strong>10</strong><span>posts</span></div>
          <div><strong>80</strong><span>followers</span></div>
          <div><strong>120</strong><span>following</span></div>
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

      {/* Icons row under View Points */}
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

      {/* Posts Grid */}
      <div className="posts-grid">
        {photos.map((p, i) => (
          <ImageWithFallback
            key={i}
            src={p}
            alt={`travel-${i}`}
            className="post-img"
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;
