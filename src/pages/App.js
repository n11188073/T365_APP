import { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faUser, faCalendar, faComment, faRightToBracket, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link, BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Upload from './Upload';
import Chat from './Chat';
import Profile from './Profile';
import Calendar from './Calendar';
import Login from './Login';
import DatabaseViewer from './DatabaseViewer';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://t365-app.onrender.com");

// Added: sample posts so we can see something on the home page
const SAMPLE_POSTS = [
  { post_id: 'demo-1', post_name: 'Shibuya Crossing' },
  { post_id: 'demo-2', post_name: 'Mount Fuji View' },
  { post_id: 'demo-3', post_name: 'Matcha Café' },
];

const Home = ({ filteredPosts, carouselIndex, handlePrev, handleNext, setCarouselIndex, handleSearch, searchQuery }) => (
  <div className="main-container">
    <input
      type="text"
      className="search"
      placeholder="Search posts..."
      value={searchQuery}
      onChange={handleSearch}
    />

    <div className="posts-grid">
      {filteredPosts.length === 0 && <p>No posts found.</p>}

      {filteredPosts.map((p) => (
        <div key={p.post_id} className="post-card">
          <h3>{p.post_name}</h3>
        </div>
      ))}
    </div>
  </div>
);

// Added: very simple HomeBasic component to only show titles
const HomeBasic = ({ posts }) => (
  <div className="main-container">
    <div className="posts-grid">
      {posts.map(p => (
        <div key={p.post_id} className="post-card">
          <h3>{p.post_name}</h3>
        </div>
      ))}
    </div>
  </div>
);

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

  // Always fetch posts on mount
  useEffect(() => { fetchPosts(); }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredPosts(posts.filter(p =>
      (p.post_name && p.post_name.toLowerCase().includes(query)) ||
      (p.tags && p.tags.toLowerCase().includes(query)) ||
      (p.location && p.location.toLowerCase().includes(query))
    ));
  };

  const handlePrev = (postId) => {
    setCarouselIndex(prev => {
      const current = prev[postId] || 0;
      const length = posts.find(p => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (current - 1 + length) % length };
    });
  };

  const handleNext = (postId) => {
    setCarouselIndex(prev => {
      const current = prev[postId] || 0;
      const length = posts.find(p => p.post_id === postId)?.media.length || 1;
      return { ...prev, [postId]: (current + 1) % length };
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeBasic posts={SAMPLE_POSTS} />} /> //added

        <Route path="/upload" element={<Upload onPostCreated={fetchPosts} />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/DatabaseViewer" element={<DatabaseViewer />} />
      </Routes>

      <div className="bottom-nav">
        <Link className="nav-icon" to="/"><FontAwesomeIcon icon={faHome} /></Link>
        <Link className="nav-icon" to="/chat"><FontAwesomeIcon icon={faComment} /></Link>
        <Link className="nav-icon" to="/upload"><FontAwesomeIcon icon={faPlus} /></Link>
        <Link className="nav-icon" to="/calendar"><FontAwesomeIcon icon={faCalendar} /></Link>
        <Link className="nav-icon" to="/profile"><FontAwesomeIcon icon={faUser} /></Link>
        <Link to="/login" className="nav-icon"><FontAwesomeIcon icon={faRightToBracket} /></Link>
        <Link to="/DatabaseViewer" className="nav-icon"><FontAwesomeIcon icon={faRightToBracket} /></Link>
      </div>
    </Router>
  );
};

export default App;
