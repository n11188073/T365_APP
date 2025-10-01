// src/pages/Calendar.js
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowUpWideShort } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Calendar = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      {/* Page header with centered title and right-aligned plus icon */}
      <div
        style={{
          width: "85vw",
          margin: "0 auto",
          position: "relative",
          marginTop: "3%",
          marginBottom: "3%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <h1 style={{ margin: 0, textAlign: "center" }}>Itineraries</h1>
        <FontAwesomeIcon
          icon={faPlus}
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          onClick={handleAddItinerary}
          title="Add new itinerary"
        />
      </div>

      {/* Main container for cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
        }}
      >

        {/* Toggle boxes */}
        <div
          style={{
            display: "flex",
            width: "85vw",
            gap: "10px",
          }}
        >
          <div
            style={{
              flex: 1,
              backgroundColor: "lightblue",
              borderRadius: "12px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1%",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem" }}>My Itineraries</h3>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1%",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1rem" }}>Saved Itineraries</h3>
          </div>
        </div>

        {/* Sort By card */}
        <div
          style={{
            width: "85vw",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            padding: "1%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>Sort By</h3>
          <FontAwesomeIcon
            icon={faArrowUpWideShort}
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
            title="Sort"
          />
        </div>

        {loading && <p>Loading itineraries...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Itinerary cards */}
        {itineraries.length === 0 ? (
          <p>No itineraries yet.</p>
        ) : (
          itineraries.map((it) => (

            <div
              key={it.itinerary_id}
              onClick={() => navigate(`/itinerary/${it.itinerary_id}`)} // navigate on click
              style={{
                width: "85vw",
                height: "10vh",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                display: "flex",
                padding: "10px",
                gap: "10px",
                cursor: "pointer", // make it look clickable
              }}
            >
              <div
                style={{
                  width: "20%",
                  height: "90%",
                  backgroundColor: "lightblue",
                  borderRadius: "8px",
                  alignSelf: "center",
                }}
              ></div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1rem" }}>{it.title}</h3>
              </div>
            </div>

          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;
