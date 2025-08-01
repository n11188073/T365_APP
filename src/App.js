import React, { useState } from 'react';
import { fetchWeather } from './api/fetchWeather';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlus, faUser, faCalendar, faComment } from '@fortawesome/free-solid-svg-icons';


const App = () => {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState('');

    const search = async (e) => {
        if(e.key === 'Enter'){
            const data = await fetchWeather(query)
            setWeather(data);
            setQuery('');
        }
    }

    return (
    <>
  <div className="main-container">
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
  </div>

  {/* Bottom Nav Bar */}
<div className="bottom-nav">
  <div className="nav-icon"><FontAwesomeIcon icon={faHome} /></div>
  <div className="nav-icon"><FontAwesomeIcon icon={faComment} /></div>
  <div className="nav-icon"><FontAwesomeIcon icon={faPlus} /></div>
  <div className="nav-icon"><FontAwesomeIcon icon={faCalendar} /></div>
  <div className="nav-icon"><FontAwesomeIcon icon={faUser} /></div>
</div>
</>


  );
};

export default App;


