import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App';
import Chat from './pages/Chat';
import New from './pages/New';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faUser, faCalendar, faComment } from '@fortawesome/free-solid-svg-icons';

import './App.css';

const Main = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.name) {
          setUserName(user.name);
        }
      } catch (e) {
        console.error("❌ Failed to parse user", e);
      }
    }
  }, []);


  return (
    <GoogleOAuthProvider clientId="708003752619-2c5sop4u7m30rg6pngpcumjacsfumobh.apps.googleusercontent.com">
      <Router>
        {/* Top bar showing login status */}
        <div style={{ padding: '10px', background: '#f2f2f2', textAlign: 'right', color: 'black' }}>
          {userName ? `Logged in as: ${userName}` : 'Not logged in'}
        </div>
        {/* Routes */}
        <div style={{ minHeight: '90vh' }}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/new" element={<New />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          <Link to="/" className="nav-icon"><FontAwesomeIcon icon={faHome} /></Link>
          <Link to="/chat" className="nav-icon"><FontAwesomeIcon icon={faComment} /></Link>
          <Link to="/new" className="nav-icon"><FontAwesomeIcon icon={faPlus} /></Link>
          <Link to="/calendar" className="nav-icon"><FontAwesomeIcon icon={faCalendar} /></Link>
          <Link to="/profile" className="nav-icon"><FontAwesomeIcon icon={faUser} /></Link>
          <Link to="/login" className="nav-icon"><FontAwesomeIcon icon={faPlus} /></Link>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default Main;
