import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Calendar = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch current user's itineraries
  const fetchItineraries = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/myItineraries`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setItineraries(data.itineraries);
      } else {
        setError(data.error || "Failed to fetch itineraries");
      }
    } catch (err) {
      console.error("Failed to fetch itineraries:", err);
      setError("Failed to fetch itineraries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  // Add new itinerary
  const handleAddItinerary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/saveItinerary`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "New Itinerary" }),
      });
      const data = await res.json();
      if (res.ok) {
        // Prepend new itinerary to state
        setItineraries(prev => [
          { itinerary_id: data.itinerary_id, title: "New Itinerary" },
          ...prev
        ]);
      } else {
        alert(`Error creating itinerary: ${data.error}`);
      }
    } catch (err) {
      console.error("Failed to create itinerary:", err);
    }
  };

  return (
    <div className="page" style={{ padding: "20px" }}>
      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1>Itineraries</h1>
        <FontAwesomeIcon
          icon={faPlus}
          className="header-icon"
          onClick={handleAddItinerary}
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
        />
      </div>

      {loading ? (
        <p>Loading itineraries...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : itineraries.length === 0 ? (
        <p>No itineraries yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {itineraries.map((it) => (
              <tr key={it.itinerary_id}>
                <td>{it.itinerary_id}</td>
                <td>{it.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Calendar;
