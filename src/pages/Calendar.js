import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Calendar = () => {
  const handleAddItinerary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/saveItinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_id: 1, title: "New Itinerary" }) // send owner_id
      });

      const data = await res.json();
      console.log("New itinerary created:", data);
      alert(`Itinerary created with ID: ${data.itinerary_id}`);
    } catch (err) {
      console.error("Failed to create itinerary:", err);
    }
  };


  return (
    <div className="page">
      <div className="page-header">
        <h1>Itineraries</h1>
        <FontAwesomeIcon
          icon={faPlus}
          className="header-icon"
          onClick={handleAddItinerary}
          style={{ cursor: "pointer" }}
        />
      </div>

      <p>
        Itinerary Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
        convallis velit non lectus imperdiet.
      </p>

      {/* Card */}
      <div className="card">
        <h2>Testing Card</h2>
        <p>This is the card content. You can put anything here.</p>
      </div>
    </div>
  );
};

export default Calendar;
