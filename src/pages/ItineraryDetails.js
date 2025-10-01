// src/pages/ItineraryDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faComment,
  faBookmark,
  faPenToSquare,
  faCircleDot,
} from "@fortawesome/free-solid-svg-icons";
import {
  faClock,
  faKeyboard,
  faMap,
  faFileLines,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com/api/itineraries"
    : "http://localhost:5000/api/itineraries";

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [activities, setActivities] = useState([]);

  // Form state for new card
  const [cardTime, setCardTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch itinerary cards from backend
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${API_BASE}/itineraryCards/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.cards) {
          const sortedCards = data.cards.sort((a, b) =>
            a.card_time.localeCompare(b.card_time)
          );
          setActivities(sortedCards);
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
      }
    };
    fetchCards();
  }, [id]);

  // Save card handler
  const handleSaveCard = async () => {
    try {
      const res = await fetch(`${API_BASE}/saveItineraryCard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itinerary_id: id,
          location_name: locationName,
          location_address: locationAddress,
          notes,
          order_index: activities.length,
          card_time: cardTime,
        }),
      });

      const data = await res.json();
      if (data.card_id) {
        setActivities((prev) => {
          const updated = [
            ...prev,
            {
              card_id: data.card_id,
              itinerary_id: id,
              location_name: locationName,
              location_address: locationAddress,
              notes,
              order_index: prev.length,
              card_time: cardTime,
            },
          ];
          return updated.sort((a, b) => a.card_time.localeCompare(b.card_time));
        });

        setShowAddEventModal(false);
        setCardTime("");
        setLocationName("");
        setLocationAddress("");
        setNotes("");
      } else {
        console.error("Error saving card:", data);
      }
    } catch (err) {
      console.error("Error saving card:", err);
    }
  };

  // Delete card handler
  const handleDeleteCard = async (card_id) => {
    try {
      const res = await fetch(
        `${API_BASE}/deleteItineraryCard/${card_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setActivities((prev) =>
          prev.filter((activity) => activity.card_id !== card_id)
        );
      } else {
        console.error("Failed to delete card:", data);
      }
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  return (
    <div style={{ padding: "20px", height: "100vh", overflowY: "auto" }}>
      {/* Header */}
      <div
        style={{
          width: "85vw",
          margin: "0 auto",
          marginTop: "3%",
          marginBottom: "3%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <FontAwesomeIcon
          icon={faChevronLeft}
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          onClick={() => navigate(-1)}
          title="Back"
        />
        <h1 style={{ margin: 0, textAlign: "center", flex: 1 }}>
          {isEditing ? `Edit Itinerary ${id}` : `Itinerary ${id}`}
        </h1>

        {!isEditing ? (
          <div
            style={{
              display: "flex",
              gap: "30px",
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <FontAwesomeIcon
              icon={faComment}
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
              title="Comments"
            />
            <FontAwesomeIcon
              icon={faBookmark}
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
              title="Bookmark"
            />
            <FontAwesomeIcon
              icon={faPenToSquare}
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
              title="Edit"
              onClick={() => setIsEditing(true)}
            />
            <FontAwesomeIcon
              icon={faCircleDot}
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
              title="Options"
            />
          </div>
        ) : (
          <span
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "blue",
            }}
            onClick={() => setIsEditing(false)}
          >
            Save
          </span>
        )}
      </div>

      {/* Add Event */}
      {isEditing && (
        <div
          onClick={() => setShowAddEventModal(true)}
          style={{
            width: "85vw",
            margin: "0 auto",
            marginBottom: "20px",
            padding: "15px",
            textAlign: "center",
            backgroundColor: "#90cdf4",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          Add Event
        </div>
      )}

      {/* Timeline */}
      <div style={{ width: "85vw", margin: "0 auto", position: "relative" }}>
        {activities.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-20px",
              width: "2px",
              height: "100%",
              backgroundColor: "#ccc",
            }}
          />
        )}

        {activities.map((activity) => (
          <div key={activity.card_id} style={{ marginBottom: "30px", position: "relative" }}>
            {/* Time + circle */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#90cdf4",
                  border: "2px solid white",
                  boxShadow: "0 0 3px rgba(0,0,0,0.2)",
                  marginRight: "8px",
                  marginLeft: "-28px",
                  flexShrink: 0,
                }}
              ></div>
              <span style={{ fontSize: "1.2rem", color: "#555" }}>
                {activity.card_time}
              </span>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              <h2 style={{ marginTop: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{activity.location_name}</span>
                {isEditing && (
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    style={{
                      cursor: "pointer",
                      color: "red",
                      fontSize: "1.2rem",
                    }}
                    title="Delete card"
                    onClick={() => handleDeleteCard(activity.card_id)}
                  />
                )}
              </h2>
              <p>{activity.location_address}</p>
              <p>{activity.notes}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "90%",
              height: "90%",
              padding: "20px",
              position: "relative",
              overflowY: "auto",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "15px",
                left: "20px",
                cursor: "pointer",
                color: "black",
                fontSize: "1rem",
              }}
              onClick={() => setShowAddEventModal(false)}
            >
              Cancel
            </span>
            <span
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                cursor: "pointer",
                color: "blue",
                fontSize: "1rem",
              }}
              onClick={handleSaveCard}
            >
              Save
            </span>

            {/* Input fields */}
            <div style={{ marginTop: "50px", display: "grid", gap: "20px" }}>
              {/* Time */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <FontAwesomeIcon
                  icon={faClock}
                  style={{ marginRight: "10px", fontSize: "150%" }}
                />
                <input
                  type="time"
                  value={cardTime}
                  onChange={(e) => setCardTime(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }}
                />
              </div>

              {/* Location Name */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <FontAwesomeIcon
                  icon={faKeyboard}
                  style={{ marginRight: "10px", fontSize: "150%" }}
                />
                <input
                  type="text"
                  placeholder="Location Name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }}
                />
              </div>

              {/* Location Address */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <FontAwesomeIcon
                  icon={faMap}
                  style={{ marginRight: "10px", fontSize: "150%" }}
                />
                <input
                  type="text"
                  placeholder="Location Address"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }}
                />
              </div>

              {/* Notes */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "12px",
                  padding: "15px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <FontAwesomeIcon
                  icon={faFileLines}
                  style={{ marginRight: "10px", fontSize: "150%" }}
                />
                <textarea
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1, resize: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetails;
