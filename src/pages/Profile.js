// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import "./Profile.css";
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
  const [expandedPost, setExpandedPost] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editData, setEditData] = useState({ post_name: "", location: "", tags: "" });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  // Fetch user posts
  useEffect(() => {
    if (!userId) return;
    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/posts?user_id=${userId}`);
        const data = await res.json();
        if (Array.isArray(data.posts)) setUserPosts(data.posts);
        else setUserPosts([]);
      } catch (err) {
        console.error("Failed to fetch user posts", err);
      }
    };
    fetchUserPosts();
  }, [userId]);

  // Carousel navigation
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

  // Start editing a post
  const startEdit = (post) => {
    setEditingPostId(post.post_id);
    setEditData({
      post_name: post.post_name,
      location: post.location || "",
      tags: post.tags || "",
    });
    setExpandedPost(post);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setExpandedPost(null);
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/posts/${editingPostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setUserPosts((prev) =>
          prev.map((p) => (p.post_id === editingPostId ? { ...p, ...editData } : p))
        );
        setEditingPostId(null);
        setExpandedPost(null);
      }
    } catch (err) {
      console.error("Failed to save edit", err);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`http://localhost:5000/posts/${postId}`, { method: "DELETE" });
      if (res.ok) setUserPosts((prev) => prev.filter((p) => p.post_id !== postId));
      if (expandedPost?.post_id === postId) setExpandedPost(null);
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  return (
    <div className="profile-container">
      {/* User Info Card */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            <ImageWithFallback
              src={user?.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
              alt="Generic Avatar"
              style={{ width: 80, height: 80, borderRadius: "50%" }}
            />
          </div>
          <div className="profile-info">
            <h2>
              {user?.name || "User"} <span className="username">@{user?.username || "user"}</span>
            </h2>
            <div className="badges">
              <span className="badge">{user?.location || "Unknown"}</span>
              <span className="badge">{userPosts.length} Posts</span>
            </div>
          </div>
          <button className="menu-btn" aria-label="menu">☰</button>
        </div>

        <p className="bio">{user?.bio || "I love travelling, follow along to see my travel experiences"}</p>

        <div className="profile-stats">
          <div><strong>{userPosts.length}</strong><span>posts</span></div>
          <div><strong>{user?.followers || 0}</strong><span>followers</span></div>
          <div><strong>{user?.following || 0}</strong><span>following</span></div>
        </div>

        <div className="profile-actions">
          <button className="edit-btn" onClick={() => setExpandedPost({})}>Edit profile</button>
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

      {/* User Posts Grid */}
      <div className="posts-grid">
        {userPosts.length === 0 && <p>No posts yet.</p>}
        {userPosts.map((post) => (
          <div
            key={post.post_id}
            className="post-tile"
            onClick={() => setExpandedPost(post)}
          >
            {post.media && post.media[0] ? (
              post.media[0].type.startsWith("image") ? (
                <img src={`data:${post.media[0].type};base64,${post.media[0].data}`} alt={post.post_name} />
              ) : (
                <video src={`data:${post.media[0].type};base64,${post.media[0].data}`} controls />
              )
            ) : null}
          </div>
        ))}
      </div>

      {/* Expanded Post / Edit Modal */}
      {expandedPost && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit/Delete Buttons */}
            {expandedPost.post_id && editingPostId !== expandedPost.post_id && (
              <div className="modal-menu">
                <button onClick={() => startEdit(expandedPost)}>Edit</button>
                <button onClick={() => deletePost(expandedPost.post_id)}>Delete</button>
              </div>
            )}

            <button className="modal-close" onClick={cancelEdit}>×</button>

            {/* Editing Form */}
            {editingPostId === expandedPost.post_id ? (
              <div className="edit-form">
                <input
                  className="edit-input"
                  value={editData.post_name}
                  onChange={(e) => setEditData({ ...editData, post_name: e.target.value })}
                  placeholder="Post Name"
                />
                <input
                  className="edit-input"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  placeholder="Location"
                />
                <input
                  className="edit-input"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  placeholder="Tags"
                />
                <div className="edit-buttons">
                  <button className="edit-btn" onClick={saveEdit}>Save</button>
                  <button className="edit-btn" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : expandedPost.post_id ? (
              /* Carousel */
              <div className="carousel" style={{ textAlign: "center" }}>
                {expandedPost.media?.length > 1 && (
                  <button className="carousel-btn left" onClick={() => handlePrev(expandedPost.post_id)}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}

                {expandedPost.media && expandedPost.media[carouselIndex[expandedPost.post_id] || 0] ? (
                  expandedPost.media[carouselIndex[expandedPost.post_id] || 0].type.startsWith("image") ? (
                    <img
                      src={`data:${expandedPost.media[carouselIndex[expandedPost.post_id] || 0].type};base64,${expandedPost.media[carouselIndex[expandedPost.post_id] || 0].data}`}
                      alt={expandedPost.post_name}
                      style={{ maxHeight: "80vh", width: "auto", display: "block", margin: "0 auto" }}
                    />
                  ) : (
                    <video
                      controls
                      src={`data:${expandedPost.media[carouselIndex[expandedPost.post_id] || 0].type};base64,${expandedPost.media[carouselIndex[expandedPost.post_id] || 0].data}`}
                      style={{ maxHeight: "80vh", width: "auto", display: "block", margin: "0 auto" }}
                    />
                  )
                ) : null}

                {expandedPost.media?.length > 1 && (
                  <>
                    <button className="carousel-btn right" onClick={() => handleNext(expandedPost.post_id)}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                    <div className="carousel-dots">
                      {expandedPost.media.map((_, idx) => (
                        <span
                          key={idx}
                          className={`dot ${carouselIndex[expandedPost.post_id] === idx ? "active" : ""}`}
                          onClick={() => setCarouselIndex((prev) => ({ ...prev, [expandedPost.post_id]: idx }))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p>No post selected</p>
            )}

            {expandedPost.post_id && (
              <>
                <p>Location: {expandedPost.location || "N/A"}</p>
                <p>Tags: {expandedPost.tags || "N/A"}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;