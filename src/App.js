import React, { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlus,
  faUser,
  faCalendar,
  faComment,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

// Automatically picks API endpoint
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://t365-app.onrender.com");

const App = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState({});

  const fallbackImageForPost = (postId, idx = 0) =>
    `https://picsum.photos/seed/${encodeURIComponent(postId)}_${idx}/800/800`;

  const defaultFeedImages = Array.from({ length: 12 }).map((_, i) =>
    `https://picsum.photos/seed/homefeed_${i}/800/800`
  );

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/posts`);
        const data = await res.json();
        if (Array.isArray(data.posts)) {
          // Group media by post_id
          const groupedPosts = data.posts.reduce((acc, item) => {
            const postId = item.post_id;
            if (!acc[postId]) acc[postId] = { ...item, media: [] };
            if (item.media_id) acc[postId].media.push(item);
            return acc;
          }, {});
          const postsArray = Object.values(groupedPosts);
          setPosts(postsArray);
          setFilteredPosts(postsArray);
        } else {
          setPosts([]);
          setFilteredPosts([]);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
        setFilteredPosts([]);
      }
    };
    fetchPosts();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = posts.filter(
      (p) =>
        (p.post_name && p.post_name.toLowerCase().includes(query)) ||
        (p.tags && p.tags.toLowerCase().includes(query)) ||
        (p.location && p.location.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);
  };

  const handlePrev = (postId) => {
    setCarouselIndex((prev) => {
      const currentIndex = prev[postId] || 0;
      const length = filteredPosts.find((p) => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (currentIndex - 1 + length) % length };
    });
  };

  const handleNext = (postId) => {
    setCarouselIndex((prev) => {
      const currentIndex = prev[postId] || 0;
      const length = filteredPosts.find((p) => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (currentIndex + 1) % length };
    });
  };

  return (
    <>
      <div className="main-container">
        <input
          type="text"
          className="search"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearch}
        />

        <div className="posts-grid">
          {filteredPosts.length === 0 && (
            <>
              <p>No posts found. Showing some inspo…</p>
              {defaultFeedImages.map((src, i) => (
                <div key={`default_${i}`} className="post-card">
                  <div className="carousel">
                    <img src={src} alt={`default_${i}`} className="post-media" />
                  </div>
                  <p>Location: N/A</p>
                  <p>Tags: #explore #inspo</p>
                </div>
              ))}
            </>
          )}

          {filteredPosts.map((p) => (
            <div key={p.post_id} className="post-card">
              <h3>{p.post_name}</h3>

              {(p.media && p.media.length > 0) ? (
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

                    const isImage = media.type === 'image';
                    const hasData = Boolean(media.data);

                    if (isImage) {
                      return (
                        <img
                          src={
                            hasData
                              ? `data:image/*;base64,${media.data}`
                              : fallbackImageForPost(p.post_id, currentIdx) 
                          }
                          alt={media.filename || 'post'}
                          className="post-media"
                        />
                      );
                    } else {
                      // video
                      return hasData ? (
                        <video
                          controls
                          src={`data:video/*;base64,${media.data}`}
                          className="post-media"
                        />
                      ) : (
                        <img
                          src={fallbackImageForPost(p.post_id, currentIdx)}
                          alt="fallback"
                          className="post-media"
                        />
                      );
                    }
                  })()}

                  {p.media.length > 1 && (
                    <button className="carousel-btn right" onClick={() => handleNext(p.post_id)}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  )}

                  {/* Dots */}
                  {p.media.length > 1 && (
                    <div className="carousel-dots">
                      {p.media.map((_, idx) => (
                        <span
                          key={idx}
                          className={`dot ${carouselIndex[p.post_id] === idx ? 'active' : ''}`}
                          onClick={() => setCarouselIndex((prev) => ({ ...prev, [p.post_id]: idx }))}
                        ></span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="carousel">
                  <img
                    src={fallbackImageForPost(p.post_id)}
                    alt="fallback"
                    className="post-media"
                  />
                </div>
              )}

              <p>Location: {p.location || 'N/A'}</p>
              <p>Tags: {p.tags || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bottom-nav">
        <div className="nav-icon"><FontAwesomeIcon icon={faHome} /></div>
        <div className="nav-icon"><FontAwesomeIcon icon={faComment} /></div>
        <div className="nav-icon"><FontAwesomeIcon icon={faPlus} /></div>
        <div className="nav-icon"><FontAwesomeIcon icon={faCalendar} /></div>
        <div className="nav-icon"><FontAwesomeIcon icon={faUser} /></div>
      </div>
    </>
  );
};

export default App;
