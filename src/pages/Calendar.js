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
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("Individual");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
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
        return; // ✅ Stop — don’t redirect
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
        body: JSON.stringify({
          title: "New Itinerary",
          collaborative: mode === "Collaborative" ? 1 : 0,
          date_start: dateStart,
          date_end: dateEnd,
        }),
      });

      const data = await res.json();

      if (res.ok && data.itinerary_id) {
        setShowModal(false);
        setItineraries((prev) => [
          {
            itinerary_id: data.itinerary_id,
            title: "New Itinerary",
            collaborative: mode === "Collaborative" ? 1 : 0,
            date_start: dateStart,
            date_end: dateEnd,
          },
          ...prev,
        ]);

        navigate(`/itinerary/${data.itinerary_id}`);
      }
    } catch (err) {
      console.error("Failed to create itinerary:", err);
      alert("Failed to create itinerary.");
    }
  };

  return (
    <div
      className="page"
      style={{
        padding: "20px",
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "85vw",
          position: "relative",
          marginTop: "3%",
          marginBottom: "3%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
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
          onClick={() => setShowModal(true)}
          title="Add new itinerary"
        />
      </div>

      {/* ✅ Main Centered Container */}
      <div
        style={{
          width: "85vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* Toggle Boxes */}
        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
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

        {/* Sort Card */}
        <div
          style={{
            width: "100%",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            padding: "1%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <h3 style={{ margin: 0 }}>Sort By</h3>
          <FontAwesomeIcon
            icon={faArrowUpWideShort}
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
          />
        </div>

        {loading && <p>Loading itineraries...</p>}

        {/* Error / Not logged in */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "red",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <p>{error}</p>
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "dodgerblue",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Itinerary Cards */}
        {!error && !loading && (
          <>
            {itineraries.length === 0 ? (
              <p>No itineraries yet.</p>
            ) : (
              itineraries.map((it) => (
                <div
                  key={it.itinerary_id}
                  onClick={() => navigate(`/itinerary/${it.itinerary_id}`)}
                  style={{
                    width: "100%",
                    height: "10vh",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                    display: "flex",
                    padding: "10px",
                    gap: "10px",
                    cursor: "pointer",
                    marginTop: "10px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "20%",
                      height: "90%",
                      backgroundColor: "lightblue",
                      borderRadius: "8px",
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
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          {/* Background */}
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          ></div>

          {/* Bottom Sheet */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "70%",
              backgroundColor: "white",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              zIndex: 1000,
              boxShadow: "0 -4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              boxSizing: "border-box",
            }}
          >
            {/* Cancel / Add */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <span
                style={{ color: "gray", cursor: "pointer" }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </span>
              <span
                style={{
                  color: "dodgerblue",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={handleAddItinerary}
              >
                Add
              </span>
            </div>

            <h3 style={{ marginBottom: "10px" }}>Itinerary Mode</h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {["Individual", "Collaborative"].map((option) => (
                <div
                  key={option}
                  onClick={() => setMode(option)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                    backgroundColor: mode === option ? "#90cdf4" : "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  {option}
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: "10px" }}>Date</h3>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
