// src/pages/Calendar.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Calendar = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItineraries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/myItineraries`, {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("You must be logged in to see your itineraries.");
        setItineraries([]);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setItineraries(data.itineraries);
      } else {
        setError(data.error || "Failed to fetch itineraries.");
      }
    } catch (err) {
      console.error("Failed to fetch itineraries:", err);
      setError("Failed to fetch itineraries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

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
        setItineraries((prev) => [
          { itinerary_id: data.itinerary_id, owner_id: "", title: "New Itinerary" },
          ...prev,
        ]);
      } else {
        alert(`Error creating itinerary: ${data.error}`);
      }
    } catch (err) {
      console.error("Failed to create itinerary:", err);
      alert("Failed to create itinerary.");
    }
  };

  return (
    <div className="page" style={{ padding: "20px", height: "100vh", overflowY: "auto" }}>
      <div
        className="page-header"
        style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}
      >
        <h1>Itineraries</h1>
        <FontAwesomeIcon
          icon={faPlus}
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
          onClick={handleAddItinerary}
          title="Add new itinerary"
        />
      </div>

      {loading && <p>Loading itineraries...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
          }}
        >
          {itineraries.length === 0 ? (
            <p>No itineraries yet.</p>
          ) : (
            itineraries.map((it) => (

              <div
                key={it.itinerary_id}
                style={{
                  width: "85vw", // fixed width
                  height: "10vh", // 10% of viewport height
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  padding: "10px",
                  gap: "10px", // spacing between left and right
                }}
              >
                {/* Left side: blue square (vertically centered by itself) */}
                <div
                  style={{
                    width: "20%",
                    height: "90%",
                    backgroundColor: "lightblue",
                    borderRadius: "8px",
                    alignSelf: "center", // keep this vertically centered
                  }}
                ></div>

                {/* Right side: itinerary title (aligned top-left) */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start", // top
                    alignItems: "flex-start",     // left
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{it.title}</h3>
                </div>
              </div>






              

            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
