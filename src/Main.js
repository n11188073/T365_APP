// Main.js
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App';
import Chat from './pages/Chat';
import New from './pages/Upload';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Login from './pages/Login'; 
import DatabaseViewer from './pages/DatabaseViewer'; // adjust path as needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faUser, faCalendar, faComment, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import 'leaflet/dist/leaflet.css';

const Main = () => {
  const [userName, setUserName] = useState('');
  const [mediaList, setMediaList] = useState([]);

  // Fetch user info and media
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.name) setUserName(user.name);
      } catch (e) {
        console.error("❌ Failed to parse user", e);
      }
    }

    // Fetch media from backend
    const fetchMedia = async () => {
      try {
        const res = await fetch('http://localhost:5000/media');
        const data = await res.json();
        // Convert base64 if needed
        if (data?.media) {
          const formattedMedia = data.media.map(m => ({
            ...m,
            src: m.data ? `data:${m.type}/*;base64,${m.data}` : ''
          }));
          setMediaList(formattedMedia);
        }
      } catch (err) {
        console.error("Failed to fetch media", err);
      }
    };

    fetchMedia();
  }, []);

  return (
    <GoogleOAuthProvider clientId="708003752619-2c5sop4u7m30rg6pngpcumjacsfumobh.apps.googleusercontent.com">
      <Router>
        {/* Top bar showing login status */}
        <div style={{ padding: '10px', background: '#f2f2f2', textAlign: 'right', color: 'black' }}>
          {userName ? `Logged in as: ${userName}` : 'Not logged in'}
        </div>

        {/* Main routes */}
        <div style={{ minHeight: '90vh' }}>
          <Routes>
            <Route path="/" element={<App mediaList={mediaList} />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/upload" element={<New />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/DatabaseViewer" element={<DatabaseViewer />} />
          </Routes>
        </div>

        <div className="bottom-nav">
          <Link to="/" className="nav-icon"><FontAwesomeIcon icon={faHome} /></Link>
          <Link to="/chat" className="nav-icon"><FontAwesomeIcon icon={faComment} /></Link>
          <Link to="/upload" className="nav-icon"><FontAwesomeIcon icon={faPlus} /></Link>
          <Link to="/calendar" className="nav-icon"><FontAwesomeIcon icon={faCalendar} /></Link>
          <Link to="/profile" className="nav-icon"><FontAwesomeIcon icon={faUser} /></Link>
          <Link to="/login" className="nav-icon"><FontAwesomeIcon icon={faRightToBracket} /></Link>
          <Link to="/DatabaseViewer" className="nav-icon"><FontAwesomeIcon icon={faRightToBracket} /></Link>
        </div>

        {/* Media grid preview */}
        <div className="media-grid">
          {mediaList.map((m, idx) => (
            <div key={idx} className="tile">
              {m.type === 'image' ? (
                <img src={m.src} alt={m.filename || `media-${idx}`} />
              ) : (
                <video src={m.src} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default Main;
