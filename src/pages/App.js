// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faPlus, faUser, faCalendar, faComment, faRightToBracket,
  faHeart, faBookmark, faPaperPlane, faCommentDots, faEllipsis,
  faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { Link, BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Pages
import Upload from './Upload';
import Chat from './Chat';
import Profile from './Profile';
import Calendar from './Calendar';
import ItineraryDetails from "./ItineraryDetails";
import ItineraryInfo from "./ItineraryInfo";
import Login from './Login';
import DatabaseViewer from './DatabaseViewer';
import SearchPage from './SearchPage';
import PostPage from './PostPage';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://t365-app.onrender.com');

// Sample demo posts
export const SAMPLE_POSTS = [
  {
    post_id: 'demo-1',
    post_name: 'London',
    location: 'United Kingdom',
    lat: 51.5074, lng: -0.1278,
    tags: 'europe city architecture',
    imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
    user_name: 'alex.london',
    user_avatar: 'https://i.pravatar.cc/80?img=12',
    caption: 'Foggy mornings hit different. #london #citywalks',
    likes: 1423,
    time_ago: '2h'
  },
  {
    post_id: 'demo-2',
    post_name: 'Shibuya Crossing',
    location: 'Tokyo',
    lat: 35.6595, lng: 139.7005,
    tags: 'japan city crossing night',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    user_name: 'kana.jp',
    user_avatar: 'https://i.pravatar.cc/80?img=23',
    caption: 'hi',
    likes: 987,
    time_ago: '5h'
  },
  {
    post_id: 'demo-3',
    post_name: 'Matcha Café',
    location: 'Omotesando',
    lat: 35.6655, lng: 139.7128,
    tags: 'japan cafe matcha dessert',
    imageUrl: 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=1200&q=80',
    user_name: 'miki.matcha',
    user_avatar: 'https://i.pravatar.cc/80?img=45',
    caption: 'hi',
    likes: 562,
    time_ago: '1d'
  },
  {
    post_id: 'demo-4',
    post_name: 'Kyoto Streets',
    location: 'Kyoto',
    lat: 35.0116, lng: 135.7681,
    tags: 'japan temple culture streets',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    user_name: 'ryo.travels',
    user_avatar: 'https://i.pravatar.cc/80?img=31',
    caption: 'hi',
    likes: 811,
    time_ago: '3h'
  },
  {
    post_id: 'demo-5',
    post_name: 'Osaka Dotonbori',
    location: 'Osaka',
    lat: 34.6687, lng: 135.5013,
    tags: 'japan canal neon food',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d0?auto=format&fit=crop&w=1200&q=80',
    user_name: 'noodles.osk',
    user_avatar: 'https://i.pravatar.cc/80?img=17',
    caption: 'hi',
    likes: 1290,
    time_ago: '8h'
  },
  {
    post_id: 'demo-6',
    post_name: 'Mount Fuji Viewpoint',
    location: 'Kawaguchiko',
    lat: 35.5177, lng: 138.7590,
    tags: 'fuji mountain lake japan nature',
    imageUrl: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=1200&q=80',
    user_name: 'fuji.frames',
    user_avatar: 'https://i.pravatar.cc/80?img=52',
    caption: 'hi',
    likes: 2033,
    time_ago: '1d'
  },
  {
    post_id: 'demo-7',
    post_name: 'Hamptons Beach Walk',
    location: 'New York',
    lat: 40.904, lng: -72.357,
    tags: 'usa beach ocean sunset',
    imageUrl: 'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80',
    user_name: 'coastline.vibes',
    user_avatar: 'https://i.pravatar.cc/80?img=6',
    caption: 'hi',
    likes: 734,
    time_ago: '6h'
  },
  {
    post_id: 'demo-8',
    post_name: 'Seoul Nights',
    location: 'Seoul',
    lat: 37.5665, lng: 126.9780,
    tags: 'korea night food city',
    imageUrl: 'https://images.unsplash.com/photo-1517152742643-409f16b70300?auto=format&fit=crop&w=1200&q=80',
    user_name: 'min.seoul',
    user_avatar: 'https://i.pravatar.cc/80?img=39',
    caption: 'hi',
    likes: 1102,
    time_ago: '12h'
  }
];

// Helper: build Google Maps link
const mapHrefFor = (post) => {
  const { lat, lng, location } = post || {};
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post?.post_name || 'map')}`;
};

// Home Component
const Home = ({
  posts,
  filteredPosts,
  carouselIndex,
  handlePrev,
  handleNext,
  setCarouselIndex,
  handleSearch,
  searchQuery
}) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Explore'); // 'Following' | 'Explore' | 'Nearby'
  const [nearbyAllowed, setNearbyAllowed] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (tab !== 'Nearby' || coords || nearbyAllowed) return;
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setNearbyAllowed(true);
      },
      () => setNearbyAllowed(false),
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, [tab, coords, nearbyAllowed]);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const followingFeed = [];
  const exploreFeed = posts;
  const nearbyFeed = nearbyAllowed && coords ? posts : posts.slice(0, 3);

  const activeFeed =
    tab === 'Following' ? followingFeed :
    tab === 'Nearby' ? nearbyFeed :
    exploreFeed;

  const formatLikes = (n = 0) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k` : `${n}`;

  return (
    <div className="main-container with-topbar">
      <div className="tiktok-topbar">
        <div className="tabs">
          {['Following', 'Explore', 'Nearby'].map((t) => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={onSubmit} className="search-wrap">
        <input
          type="text"
          className="search"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
        />
      </form>

      {/* Empty states */}
      {tab === 'Following' && activeFeed.length === 0 && (
        <div className="empty-state">
          <h3>No following yet</h3>
          <p className="muted">Follow creators to see their posts here.</p>
          <button className="chip" onClick={() => setTab('Explore')}>Explore</button>
        </div>
      )}

      {tab === 'Nearby' && !nearbyAllowed && (
        <div className="empty-state">
          <h3>See what’s nearby</h3>
          <p className="muted">
            Enable location to personalize this tab. We’ll fall back to popular posts if not allowed.
          </p>
          <div className="chip-row">
            <button className="chip" onClick={() => setTab('Explore')}>Explore</button>
            <button className="chip" onClick={() => setTab('Following')}>Following</button>
          </div>
        </div>
      )}

      <div className="posts-grid">

        {activeFeed.map((p) => (
          <article key={p.post_id} className="ig-card">
            {/* Header */}
            <header className="ig-header">
              <div className="ig-user">
                <img
                  className="ig-avatar"
                  src={p.user_avatar || 'https://i.pravatar.cc/80?u=placeholder'}
                  alt={p.user_name || 'user'}
                />
                <div className="ig-user-meta">
                  <div className="ig-username">{p.user_name || 'traveler'}</div>
                  <div className="ig-location">
                    {p.location ? (
                      <a href={mapHrefFor(p)} target="_blank" rel="noopener noreferrer">
                        {p.location}
                      </a>
                    ) : '—'}
                  </div>
                </div>
              </div>
              <button className="icon-btn" aria-label="More">
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
            </header>

            {/* Media */}
            <Link to={`/post/${p.post_id}`} className="ig-media-wrap">
              {p.media && p.media.length > 0 ? (
                <div className="carousel">
                  {p.media.length > 1 && (
                    <button className="carousel-btn left" onClick={() => handlePrev(p.post_id)}>
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                  )}
                  {(() => {
                    const idx = carouselIndex[p.post_id] || 0;
                    const media = p.media[idx];
                    if (!media) return null;
                    return media.type === 'image' ? (
                      <img src={`data:image/*;base64,${media.data}`} alt={media.filename} className="post-media" />
                    ) : (
                      <video controls src={`data:video/*;base64,${media.data}`} className="post-media" />
                    );
                  })()}
                  {p.media.length > 1 && (
                    <button className="carousel-btn right" onClick={() => handleNext(p.post_id)}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  )}
                </div>
              ) : (
                <img className="ig-media" src={p.imageUrl} alt={p.post_name} />
              )}
            </Link>

            {/* Actions */}
            <div className="ig-actions">
              <div className="left">
                <button className="icon-btn" aria-label="Like">
                  <FontAwesomeIcon icon={faHeart} />
                </button>
                <button className="icon-btn" aria-label="Comment">
                  <FontAwesomeIcon icon={faCommentDots} />
                </button>
                <button className="icon-btn" aria-label="Share">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </div>
              <div className="right">
                <button className="icon-btn" aria-label="Save">
                  <FontAwesomeIcon icon={faBookmark} />
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="ig-meta">
              <div className="ig-likes">{formatLikes(p.likes || 0)} likes</div>
              <div className="ig-caption">
                <span className="ig-username">{p.user_name || 'traveler'}</span> {p.caption || p.post_name}
              </div>
              <button className="ig-comments">View all comments</button>
              <div className="ig-time">{p.time_ago || 'now'}</div>
            </div>
          </article>
        ))}

        {/* Sample posts fallback */}
        {SAMPLE_POSTS.map((p) => (
          <div key={p.post_id} className="post-card">
            <h3>{p.post_name}</h3>
            {p.imageUrl && <img src={p.imageUrl} alt={p.post_name} className="post-media" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// App Component
const App = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState({});

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
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

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
              posts={posts}
              filteredPosts={filteredPosts}
              carouselIndex={carouselIndex}
              setCarouselIndex={setCarouselIndex}
              handlePrev={handlePrev}
              handleNext={handleNext}
              handleSearch={handleSearch}
              searchQuery={searchQuery}
            />
          }
        />
        <Route path="/search" element={<SearchPage posts={SAMPLE_POSTS} />} />
        <Route path="/post/:id" element={<PostPage posts={SAMPLE_POSTS} />} />
        <Route path="/upload" element={<Upload onPostCreated={fetchPosts} />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/itinerary/:id" element={<ItineraryDetails />} />
        <Route path="/itineraryInfo/:id" element={<ItineraryInfo />} />
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