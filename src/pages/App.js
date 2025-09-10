// src/App.js
import { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlus,
  faUser,
  faCalendar,
  faComment,
  faRightToBracket,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  Link,
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import SearchPage from "./SearchPage";

// Pages
import Upload from './Upload';
import Chat from './Chat';
import Profile from './Profile';
import Calendar from './Calendar';
import Login from './Login';
import DatabaseViewer from './DatabaseViewer';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://t365-app.onrender.com');

// Sample demo posts
const SAMPLE_POSTS = [
  {
    post_id: 'demo-1',
    post_name: 'London',
    imageUrl:
      'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
  },
  {
    post_id: 'demo-2',
    post_name: 'Shibuya Crossing',
    imageUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  },
  {
    post_id: 'demo-3',
    post_name: 'Matcha Café',
    imageUrl:
      'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=1200&q=80',
  },
];

const Home = ({
  filteredPosts,
  carouselIndex,
  handlePrev,
  handleNext,
  setCarouselIndex,
  handleSearch,
  searchQuery,
}) => {
  
  const navigate = useNavigate();

  const goToSearch = () => {
    const q = (searchQuery || "").trim();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="main-container">
      <input
        type="text"
        className="search"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={handleSearch}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); goToSearch(); } }}
      />

      <div className="posts-grid">
        {/* DB posts */}
        {filteredPosts.length === 0 && <p>No posts found.</p>}

        {filteredPosts.map((p) => (
          <div key={p.post_id} className="post-card">
            <h3>{p.post_name}</h3>

            {p.media && p.media.length > 0 && (
              <div className="carousel">
                {p.media.length > 1 && (
                  <button
                    className="carousel-btn left"
                    onClick={() => handlePrev(p.post_id)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                )}

                {(() => {
                  const currentIdx = carouselIndex[p.post_id] || 0;
                  const media = p.media[currentIdx];
                  if (!media) return null;
                  return media.type === 'image' ? (
                    <img
                      src={`data:image/*;base64,${media.data}`}
                      alt={media.filename}
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
                  <button
                    className="carousel-btn right"
                    onClick={() => handleNext(p.post_id)}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                )}

                {p.media.length > 1 && (
                  <div className="carousel-dots">
                    {p.media.map((_, idx) => (
                      <span
                        key={idx}
                        className={`dot ${
                          carouselIndex[p.post_id] === idx ? 'active' : ''
                        }`}
                        onClick={() =>
                          setCarouselIndex((prev) => ({
                            ...prev,
                            [p.post_id]: idx,
                          }))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <p>Location: {p.location || 'N/A'}</p>
            <p>Tags: {p.tags || 'N/A'}</p>
          </div>
        ))}

        {/* Sample demo posts below DB posts */}
        <h3 style={{ marginTop: '20px' }}>Sample Posts</h3>
        {SAMPLE_POSTS.map((p) => (
          <div key={p.post_id} className="post-card">
            <h3>{p.post_name}</h3>
            {p.imageUrl && (
              <img src={p.imageUrl} alt={p.post_name} className="post-media" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState({});

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/posts`);
      const data = await res.json();
      if (Array.isArray(data.posts)) {
        const groupedPosts = data.posts.reduce((acc, item) => {
          const postId = item.post_id;
          if (!acc[postId]) acc[postId] = { ...item, media: [] };
          if (item.media_id) acc[postId].media.push(item);
          return acc;
        }, {});
        const postsArray = Object.values(groupedPosts);
        setPosts(postsArray);
        setFilteredPosts(postsArray);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredPosts(
      posts.filter(
        (p) =>
          (p.post_name && p.post_name.toLowerCase().includes(query)) ||
          (p.tags && p.tags.toLowerCase().includes(query)) ||
          (p.location && p.location.toLowerCase().includes(query))
      )
    );
  };

  const handlePrev = (postId) => {
    setCarouselIndex((prev) => {
      const current = prev[postId] || 0;
      const length = posts.find((p) => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (current - 1 + length) % length };
    });
  };

  const handleNext = (postId) => {
    setCarouselIndex((prev) => {
      const current = prev[postId] || 0;
      const length = posts.find((p) => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (current + 1) % length };
    });
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              filteredPosts={filteredPosts}
              carouselIndex={carouselIndex}
              handlePrev={handlePrev}
              handleNext={handleNext}
              setCarouselIndex={setCarouselIndex}
              handleSearch={handleSearch}
              searchQuery={searchQuery}
            />
          }
        />
        <Route path="/upload" element={<Upload onPostCreated={fetchPosts} />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/DatabaseViewer" element={<DatabaseViewer />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>

      <div className="bottom-nav">
        <Link className="nav-icon" to="/">
          <FontAwesomeIcon icon={faHome} />
        </Link>
        <Link className="nav-icon" to="/chat">
          <FontAwesomeIcon icon={faComment} />
        </Link>
        <Link className="nav-icon" to="/upload">
          <FontAwesomeIcon icon={faPlus} />
        </Link>
        <Link className="nav-icon" to="/calendar">
          <FontAwesomeIcon icon={faCalendar} />
        </Link>
        <Link className="nav-icon" to="/profile">
          <FontAwesomeIcon icon={faUser} />
        </Link>
        <Link to="/login" className="nav-icon">
          <FontAwesomeIcon icon={faRightToBracket} />
        </Link>
        <Link to="/DatabaseViewer" className="nav-icon">
          <FontAwesomeIcon icon={faRightToBracket} />
        </Link>
      </div>
    </Router>
  );
};

export default App;
