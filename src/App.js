// App.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const App = ({ user, setUser }) => {
  const [weather, setWeather] = useState("");
  const [query, setQuery] = useState("");

  // Check cookie/session login on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          method: "GET",
          credentials: "include", // include cookies
        });
        const data = await res.json();
        if (data.loggedIn) setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    };
    checkSession();
  }, [setUser]);

  const search = async (e) => {
    if (e.key === "Enter") {
      const data = await fetchWeather(query);
      setWeather(data);
      setQuery("");
    }
  };

  return (
    <div className="main-container">
      {/* Home / Weather Input */}
      <input
        type="text"
        className="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={search}
      />

      {/* Weather Results */}
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
    </div>
  );
};

export default App;
