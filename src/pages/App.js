// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlus,
  faUser,
  faCalendar,
  faComment,
  faRightToBracket,
  faHeart,
  faBookmark,
  faPaperPlane,
  faCommentDots,
  faEllipsis,
  faChevronLeft, 
  faChevronRight, 
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { Link, BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Pages.
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
    location: 'Westminster, London',
    lat: 51.5007, lng: -0.1246,
    tags: 'uk big ben river thames landmark',
    imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-2',
    post_name: 'Shibuya Crossing',
    location: 'Shibuya City, Tokyo',
    lat: 35.6595, lng: 139.7005,
    tags: 'tokyo nightlife neon streets japan',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-3',
    post_name: 'Matcha Café',
    location: 'Nishiki Market, Kyoto',
    lat: 35.0054, lng: 135.7640,
    tags: 'cafe dessert matcha kyoto sweets',
    imageUrl: 'https://images.unsplash.com/photo-1575853121743-60c24f0a7502?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-4',
    post_name: 'Kyoto Streets',
    location: 'Gion, Kyoto',
    lat: 35.0037, lng: 135.7788,
    tags: 'kyoto gion night street photography',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-5',
    post_name: 'Osaka Dotonbori',
    location: 'Dōtonbori, Osaka',
    lat: 34.6687, lng: 135.5011,
    tags: 'osaka canal food street nightlife',
    imageUrl: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-6',
    post_name: 'Great Ocean Road',
    location: 'Victoria, Australia',
    lat: -38.6650, lng: 143.3920,
    tags: 'australia coast road trip scenery',
    imageUrl: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-7',
    post_name: 'Seoul Night',
    location: 'Myeongdong, Seoul',
    lat: 37.5636, lng: 126.9827,
    tags: 'seoul korea night market street',
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-8',
    post_name: 'Taipei Alley',
    location: 'Zhongzheng, Taipei',
    lat: 25.0329, lng: 121.5654,
    tags: 'taipei taiwan alley urban travel',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-9',
    post_name: 'Hanoi Old Quarter',
    location: 'Hoàn Kiếm, Hanoi',
    lat: 21.0359, lng: 105.8520,
    tags: 'vietnam street scooter food culture',
    imageUrl: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-10',
    post_name: 'Bangkok Markets',
    location: 'Chatuchak, Bangkok',
    lat: 13.7996, lng: 100.5506,
    tags: 'thailand market street food shopping',
    imageUrl: 'https://images.unsplash.com/photo-1504270997636-07ddfbd48945?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-11',
    post_name: 'Santorini',
    location: 'Oia, Santorini',
    lat: 36.4618, lng: 25.3753,
    tags: 'greece island blue domes sunset',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-12',
    post_name: 'Amalfi Coast',
    location: 'Positano, Italy',
    lat: 40.6280, lng: 14.4849,
    tags: 'italy coast cliff village beach',
    imageUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-13',
    post_name: 'Paris Café',
    location: 'Le Marais, Paris',
    lat: 48.8576, lng: 2.3626,
    tags: 'paris cafe brunch croissant france',
    imageUrl: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-14',
    post_name: 'Lisbon Tram',
    location: 'Alfama, Lisbon',
    lat: 38.7139, lng: -9.1306,
    tags: 'lisbon tram hills pastel houses',
    imageUrl: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-15',
    post_name: 'Istanbul Bazaar',
    location: 'Grand Bazaar, Istanbul',
    lat: 41.0106, lng: 28.9684,
    tags: 'istanbul bazaar spices market turkey',
    imageUrl: 'https://images.unsplash.com/photo-1519050263182-513a8eacb0ff?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-16',
    post_name: 'Marrakesh Souk',
    location: 'Medina, Marrakesh',
    lat: 31.6295, lng: -7.9811,
    tags: 'morocco souk lanterns market medina',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-17',
    post_name: 'New York Rooftop',
    location: 'Midtown, Manhattan',
    lat: 40.7580, lng: -73.9855,
    tags: 'new york skyline rooftop city usa',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-18',
    post_name: 'Chef’s Table',
    location: 'Soho, London',
    lat: 51.5136, lng: -0.1365,
    tags: 'restaurant fine dining tasting menu',
    imageUrl: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-19',
    post_name: 'Swiss Alps',
    location: 'Lauterbrunnen, Switzerland',
    lat: 46.5930, lng: 7.9070,
    tags: 'switzerland alps stars mountains nature',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80'
  },
  {
    post_id: 'demo-20',
    post_name: 'Lake Como',
    location: 'Varenna, Lake Como',
    lat: 46.0101, lng: 9.2833,
    tags: 'italy lake boating summer mountains',
    imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'
  }
];


// Helper: build Google Maps link
const mapHrefFor = (post) => {
  const { lat, lng, location } = post || {};
  if (typeof lat === 'number' && typeof lng === 'number') return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  if (location) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
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
      (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setNearbyAllowed(true); },
      () => setNearbyAllowed(false),
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, [tab, coords, nearbyAllowed]);

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const followingFeed = [];
  const exploreFeed = filteredPosts;
  const nearbyFeed = nearbyAllowed && coords ? filteredPosts : filteredPosts.slice(0, 3);

  const mergedFeed =
    tab === 'Following' ? followingFeed :
    tab === 'Nearby' ? nearbyFeed :
    [...exploreFeed, ...SAMPLE_POSTS];

  const formatLikes = (n = 0) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k` : `${n}`;

  return (
    <div className="main-container with-topbar">
      <div className="tiktok-topbar">
        <div className="tabs">
          {['Following', 'Explore', 'Nearby'].map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

     <form onSubmit={onSubmit} className="search-wrap">
   <input
     type="text"
     className="search"
     placeholder="Search destinations, cafes, ideas…"
     value={searchQuery}
     onChange={handleSearch}
   />
    <button type="submit" className="search-icon-btn" aria-label="Search">
     <FontAwesomeIcon icon={faMagnifyingGlass} />
   </button>
  </form>

      {tab === 'Following' && mergedFeed.length === 0 && (
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

      <div className="posts-grid home-grid">
        {mergedFeed.map((p) => (
          <article key={p.post_id} className={`ig-card ${Array.isArray(p.media) && p.media.some(m => m.type === 'video') ? 'has-video' : ''}`}>
            <header className="ig-header">
              <div className="ig-user">
                <img className="ig-avatar" src={p.user_avatar || 'https://i.pravatar.cc/80?u=placeholder'} alt={p.user_name || 'user'} />
                <div className="ig-user-meta">
                  <div className="ig-username">{p.user_name || 'traveler'}</div>
                  <div className="ig-location">
                    {p.location ? (
                      <a href={mapHrefFor(p)} target="_blank" rel="noopener noreferrer">{p.location}</a>
                    ) : '—'}
                  </div>
                </div>
              </div>
              <button className="icon-btn" aria-label="More"><FontAwesomeIcon icon={faEllipsis} /></button>
            </header>

              <Link to={`/post/${p.post_id}`} state={{ post: p }} className="ig-media-wrap">
              {p.media && p.media.length > 0 ? (
                <div className="carousel">
                  {p.media.length > 1 && <button className="carousel-btn left" onClick={() => handlePrev(p.post_id)}><FontAwesomeIcon icon={faChevronLeft} /></button>}
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
                  {p.media.length > 1 && <button className="carousel-btn right" onClick={() => handleNext(p.post_id)}><FontAwesomeIcon icon={faChevronRight} /></button>}
                  {p.media.length > 1 && (
                    <div className="carousel-dots">
                      {p.media.map((_, idx) => (
                        <span key={idx} className={`dot ${carouselIndex[p.post_id] === idx ? 'active' : ''}`} onClick={() => setCarouselIndex((prev) => ({ ...prev, [p.post_id]: idx }))} />
                      ))}
                    </div>
                  )}
                </div>
              ) : p.imageUrl ? <img className="ig-media" src={p.imageUrl} alt={p.post_name} /> : null}
            </Link>

            {p.media && p.media.length > 0 && (
              <div className="ig-actions">
                <div className="left">
                  <button className="icon-btn" aria-label="Like"><FontAwesomeIcon icon={faHeart} /></button>
                  <button className="icon-btn" aria-label="Comment"><FontAwesomeIcon icon={faCommentDots} /></button>
                  <button className="icon-btn" aria-label="Share"><FontAwesomeIcon icon={faPaperPlane} /></button>
                </div>
                <div className="right">
                  <button className="icon-btn" aria-label="Save"><FontAwesomeIcon icon={faBookmark} /></button>
                </div>
              </div>
            )}

            <div className="ig-meta">
              <div className="ig-likes">{(p.likes || p.num_likes || 0).toLocaleString()} likes</div>
              <div className="ig-caption"><span className="ig-username">{p.user_name || 'traveler'}</span> {p.caption || p.post_name}</div>
              <button className="ig-comments">View all comments</button>
              <div className="ig-time">{p.time_ago || 'now'}</div>
            </div>
          </article>
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

          // Only add media if media_id exists
          if (item.media_id) {
            const base64Data = item.data ? (typeof item.data === 'string' ? item.data : Buffer.from(item.data).toString('base64')) : null;
            acc[postId].media.push({ ...item, data: base64Data });
          }

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
        <Route path="/" element={
          <Home
            posts={posts}
            filteredPosts={filteredPosts}
            carouselIndex={carouselIndex}
            handlePrev={handlePrev}
            handleNext={handleNext}
            setCarouselIndex={setCarouselIndex}
            handleSearch={handleSearch}
            searchQuery={searchQuery}
          />
        } />
        <Route path="/upload" element={<Upload onPostCreated={fetchPosts} />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/itinerary/:id" element={<ItineraryDetails />} />
        <Route path="/itineraryInfo/:id" element={<ItineraryInfo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/DatabaseViewer" element={<DatabaseViewer />} />
        <Route path="/search" element={<SearchPage posts={[...posts, ...SAMPLE_POSTS]} />} />
         <Route path="/post/:id" element={<PostPage posts={posts} />} />
      </Routes>

      <div className="bottom-nav">
        <Link className="nav-icon" to="/"><FontAwesomeIcon icon={faHome} /></Link>
        <Link className="nav-icon" to="/chat"><FontAwesomeIcon icon={faComment} /></Link>
        <Link className="nav-icon" to="/upload"><FontAwesomeIcon icon={faPlus} /></Link>
        <Link className="nav-icon" to="/calendar"><FontAwesomeIcon icon={faCalendar} /></Link>
        <Link className="nav-icon" to="/profile"><FontAwesomeIcon icon={faUser} /></Link>
      </div>
    </Router>
  );
};

export default App;
