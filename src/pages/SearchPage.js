import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';

const SUGGESTIONS = [
  'Tokyo', 'Kyoto', 'Osaka', 'Shibuya', 'Matcha', 'Onsen',
  'Mount Fuji', 'Cafe', 'Viewpoint', 'Beach'
];

// ---------- helpers ----------
const mapHrefFor = (item) => {
  const { lat, lng, location, post_name } = item || {};
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }
  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post_name || 'map')}`;
};

const scoreText = (text = '', q = '') => {
  if (!q) return 0;
  const hay = text.toLowerCase();
  const needle = q.toLowerCase();
  let s = 0;
  if (hay.includes(needle)) s += 3;
  if (hay.startsWith(needle)) s += 4;
  return s;
};

const scorePost = (p, q) => {
  const hay = `${p.post_name || ''} ${p.tags || ''} ${p.location || ''}`;
  let s = scoreText(hay, q);
  s += scoreText(p.post_name || '', q);
  s += scoreText(p.location || '', q) * 0.5;
  return s;
};

const filterSortPosts = (posts, q) =>
  posts
    .map(p => ({ ...p, _score: scorePost(p, q) }))
    .filter(p => q ? p._score > 0 : true)
    .sort((a, b) => b._score - a._score);

// Build unique users from posts
const buildUsers = (posts) => {
  const byUser = new Map();
  posts.forEach(p => {
    const key = (p.user_name || 'user').trim();
    if (!byUser.has(key)) {
      byUser.set(key, {
        user_name: key,
        user_avatar: p.user_avatar,
        posts: [p],
      });
    } else {
      byUser.get(key).posts.push(p);
    }
  });
  return Array.from(byUser.values()).map(u => ({
    ...u,
    post_count: u.posts.length,
    sample_image: u.posts[0]?.imageUrl,
    location_sample: u.posts[0]?.location,
  }));
};

const filterSortUsers = (users, q) =>
  users
    .map(u => ({
      ...u,
      _score: scoreText(u.user_name, q) + (q ? 0 : 0) + Math.min(u.post_count, 3) // small boost for active users
    }))
    .filter(u => q ? u._score > 0 : true)
    .sort((a, b) => b._score - a._score);

// Build unique places from posts
const buildPlaces = (posts) => {
  const byPlace = new Map();
  posts.forEach(p => {
    const key = (p.location || '').trim();
    if (!key) return;
    if (!byPlace.has(key)) {
      byPlace.set(key, {
        location: key,
        lat: p.lat,
        lng: p.lng,
        posts: [p],
      });
    } else {
      const ref = byPlace.get(key);
      // prefer first lat/lng seen
      if (ref.lat == null && p.lat != null) ref.lat = p.lat;
      if (ref.lng == null && p.lng != null) ref.lng = p.lng;
      ref.posts.push(p);
    }
  });
  return Array.from(byPlace.values()).map(pl => ({
    ...pl,
    count: pl.posts.length,
    sample_image: pl.posts[0]?.imageUrl,
  }));
};

const filterSortPlaces = (places, q) =>
  places
    .map(pl => ({
      ...pl,
      _score: scoreText(pl.location, q) + (q ? 0 : 0) + Math.min(pl.count, 3) // small boost for popular places
    }))
    .filter(pl => q ? pl._score > 0 : true)
    .sort((a, b) => b._score - a._score);

// ---------- component ----------
const SearchPage = ({ posts = [] }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawQ = (params.get('q') || '').trim();

  const [q, setQ] = useState(rawQ);
  const [debouncedQ, setDebouncedQ] = useState(rawQ);
  const [activeTab, setActiveTab] = useState('All'); // All | Posts | Users | Places

  // debounce typing
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q]);

  // sync when URL changes
  useEffect(() => {
    setQ(rawQ);
    setDebouncedQ(rawQ);
  }, [rawQ]);

  // derived datasets
  const usersAll = useMemo(() => buildUsers(posts), [posts]);
  const placesAll = useMemo(() => buildPlaces(posts), [posts]);

  const postsFiltered = useMemo(() => filterSortPosts(posts, debouncedQ), [posts, debouncedQ]);
  const usersFiltered = useMemo(() => filterSortUsers(usersAll, debouncedQ), [usersAll, debouncedQ]);
  const placesFiltered = useMemo(() => filterSortPlaces(placesAll, debouncedQ), [placesAll, debouncedQ]);

  const hasAny =
    (activeTab === 'All' && (postsFiltered.length || usersFiltered.length || placesFiltered.length)) ||
    (activeTab === 'Posts' && postsFiltered.length) ||
    (activeTab === 'Users' && usersFiltered.length) ||
    (activeTab === 'Places' && placesFiltered.length);

  const onSubmit = (e) => {
    e.preventDefault();
    setDebouncedQ(q.trim());
  };

  return (
    <div className="main-container">
      <h2>Search</h2>

      {/* query input */}
      <form onSubmit={onSubmit} style={{ marginBottom: 12 }}>
        <input
          type="text"
          className="search"
          placeholder='Try “Tokyo”, “Matcha”, “Onsen”…'
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      {/* tabs */}
      <div className="tabs" style={{ marginBottom: 8 }}>
        {['All', 'Posts', 'Users', 'Places'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* suggestions row */}
      <div className="helper-row" style={{ marginBottom: 8 }}>
        <span className="muted">Suggestions:</span>
        <div className="chip-row">
          {SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s}
              className="chip"
              onClick={() => { setQ(s); setDebouncedQ(s); }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {debouncedQ && <p>Query: {debouncedQ || '—'}</p>}

      {/* results */}
      <div className="posts-grid">
        {/* ALL tab shows sections if present */}
        {activeTab === 'All' && (
          <>
            {postsFiltered.length > 0 && (
              <>
                <h3 style={{ margin: '4px 0' }}>Posts</h3>
                {postsFiltered.slice(0, 5).map(p => (
                  <div key={p.post_id} className="post-card">
                    <Link
                      to={`/post/${p.post_id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.post_name} className="post-media" />
                      )}
                      <h3 style={{ paddingTop: 8, margin: 0 }}>{p.post_name}</h3>
                    </Link>
                    <p className="muted small">
                      {p.location ? (
                        <a
                          href={mapHrefFor(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open in Google Maps"
                        >
                          {p.location}
                        </a>
                      ) : '—'}
                    </p>
                  </div>
                ))}
              </>
            )}

            {usersFiltered.length > 0 && (
              <>
                <h3 style={{ margin: '8px 0 4px' }}>Users</h3>
                {usersFiltered.slice(0, 5).map(u => (
                  <div key={u.user_name} className="post-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10 }}>
                    <img
                      src={u.user_avatar || 'https://i.pravatar.cc/80?u=placeholder'}
                      alt={u.user_name}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.user_name}</div>
                      <div className="muted small">{u.post_count} posts</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {placesFiltered.length > 0 && (
              <>
                <h3 style={{ margin: '8px 0 4px' }}>Places</h3>
                {placesFiltered.slice(0, 5).map(pl => (
                  <a
                    key={pl.location}
                    className="post-card"
                    href={mapHrefFor(pl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in Google Maps"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {pl.sample_image && (
                      <img
                        src={pl.sample_image}
                        alt={pl.location}
                        className="post-media"
                        style={{ maxHeight: 220, objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700 }}>{pl.location}</div>
                      <div className="muted small">{pl.count} related posts</div>
                    </div>
                  </a>
                ))}
              </>
            )}
          </>
        )}

        {/* POSTS tab */}
        {activeTab === 'Posts' && postsFiltered.map(p => (
          <div key={p.post_id} className="post-card">
            <Link
              to={`/post/${p.post_id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.post_name} className="post-media" />
              )}
              <h3 style={{ paddingTop: 8, margin: 0 }}>{p.post_name}</h3>
            </Link>
            <p className="muted small">
              {p.location ? (
                <a
                  href={mapHrefFor(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Maps"
                >
                  {p.location}
                </a>
              ) : '—'}
            </p>
            <p className="muted small">{p.tags || ''}</p>
          </div>
        ))}

        {/* USERS tab */}
        {activeTab === 'Users' && usersFiltered.map(u => (
          <div key={u.user_name} className="post-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10 }}>
            <img
              src={u.user_avatar || 'https://i.pravatar.cc/80?u=placeholder'}
              alt={u.user_name}
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>{u.user_name}</div>
              <div className="muted small">{u.post_count} posts</div>
              {u.location_sample && <div className="muted small">{u.location_sample}</div>}
            </div>
          </div>
        ))}

        {/* PLACES tab */}
        {activeTab === 'Places' && placesFiltered.map(pl => (
          <a
            key={pl.location}
            className="post-card"
            href={mapHrefFor(pl)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {pl.sample_image && (
              <img
                src={pl.sample_image}
                alt={pl.location}
                className="post-media"
                style={{ maxHeight: 240, objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontWeight: 700 }}>{pl.location}</div>
              <div className="muted small">{pl.count} related posts</div>
            </div>
          </a>
        ))}
      </div>

      {/* empty state */}
      {!hasAny && (
        <div className="post-card" style={{ marginTop: 8 }}>
          <p><strong>No results{debouncedQ ? ` for “${debouncedQ}”` : ''}.</strong></p>
          <p className="muted">Try a broader term or pick a suggestion below.</p>
          <div className="chip-row" style={{ marginBottom: 10 }}>
            {SUGGESTIONS.slice(0, 6).map((s) => (
              <button
                key={s}
                className="chip"
                onClick={() => { setQ(s); setDebouncedQ(s); }}
              >
                {s}
              </button>
            ))}
          </div>
          <div>
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
