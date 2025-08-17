import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { fetchWeather } from "./api/fetchWeather";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPlus,
  faUser,
  faCalendar,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

import Login from "./pages/Login";
import Profile from "./pages/Profile";

const App = () => {
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState("");
  const [query, setQuery] = useState("");

  // Restore user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const search = async (e) => {
    if (e.key === "Enter") {
      const data = await fetchWeather(query);
      setWeather(data);
      setQuery("");
    }
  };

  return (
    <Router>
      <div className="main-container">
        <Routes>
          {/* Home Page (Weather) */}
          <Route
            path="/"
            element={
              <>
                <input
                  type="text"
                  className="search"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={search}
                />
                {weather.main && (
                  <div className="city">
                    <h2 className="city-name">
                      <span>{weather.name}</span>
                      <sup>{weather.sys.country}</sup>
                      <div className="city-temp">
                        {Math.round(weather.main.temp)}
                        <sup>&deg;C</sup>
                      </div>
                      <div className="info">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                          alt="weather icon"
                          className="city-icon"
                        />
                        <p>{weather.weather[0].description}</p>
                      </div>
                    </h2>
                  </div>
                )}
              </>
            }
          />

          {/* Login Page */}
          <Route
            path="/login"
            element={<Login user={user} setUser={setUser} />}
          />

          {/* Profile Page */}
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>

      {/* Bottom Nav Bar */}
      <div className="bottom-nav">
        <Link to="/" className="nav-icon">
          <FontAwesomeIcon icon={faHome} />
        </Link>
        <div className="nav-icon">
          <FontAwesomeIcon icon={faComment} />
        </div>
        <div className="nav-icon">
          <FontAwesomeIcon icon={faPlus} />
        </div>
        <div className="nav-icon">
          <FontAwesomeIcon icon={faCalendar} />
        </div>
        <Link to="/profile" className="nav-icon">
          <FontAwesomeIcon icon={faUser} />
        </Link>
      </div>
    </Router>
  );
};

export default App;
