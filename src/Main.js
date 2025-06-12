import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App';
import Chat from './pages/Chat';
import New from './pages/New';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faUser, faCalendar, faComment } from '@fortawesome/free-solid-svg-icons';

import './App.css';

const Main = () => {
  return (
    <Router>
      <div style={{ minHeight: '90vh' }}>
        <Routes>
           <Route path="/" element={<App />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/new" element={<New />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        <Link to="/" className="nav-icon"><FontAwesomeIcon icon={faHome} /></Link>
        <Link to="/chat" className="nav-icon"><FontAwesomeIcon icon={faComment} /></Link>
        <Link to="/new" className="nav-icon"><FontAwesomeIcon icon={faPlus} /></Link>
        <Link to="/calendar" className="nav-icon"><FontAwesomeIcon icon={faCalendar} /></Link>
        <Link to="/profile" className="nav-icon"><FontAwesomeIcon icon={faUser} /></Link>
      </div>
    </Router>
  );
};

export default Main;