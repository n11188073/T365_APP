import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faPenToSquare,
  faCalendarDays,
  faMapMarkerAlt,
  faUsers,
  faUserPlus,
  faLock,
  faRightFromBracket,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const ItineraryInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get itinerary_id from URL

  const [isPrivate, setIsPrivate] = useState(false);
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [title, setTitle] = useState("");

  const handleTogglePrivate = () => {
    setIsPrivate((prev) => !prev);
  };

  // Update title API call
  const handleSaveTitle = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/itineraries/updateItineraryTitle`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary_id: id, title }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowEditTitle(false);
      } else {
        alert(`Error: ${data.error || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("Error updating title:", err);
      alert("Could not update title");
    }
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  };

  const iconTextStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  const arrowStyle = {
    color: "#A0AEC0",
    fontSize: "1rem",
  };

  const boxStyle = {
    width: "85vw",
    margin: "0 auto 25px auto",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
    padding: "20px",
    fontSize: "1.3rem",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
          justifyContent: "center",
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
        <h1 style={{ margin: 0, textAlign: "center", fontSize: "1.8rem" }}>
          Trip Details
        </h1>
      </div>

      {/* First Box: Trip Info */}
      <div style={boxStyle}>
        <div style={rowStyle} onClick={() => setShowEditTitle(true)}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faPenToSquare}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Edit Title</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} style={arrowStyle} />
        </div>

        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faCalendarDays}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Edit Dates</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} style={arrowStyle} />
        </div>

        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Location</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} style={arrowStyle} />
        </div>
      </div>

      {/* Second Box: Members & Management */}
      <div style={boxStyle}>
        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faUsers}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Members</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} style={arrowStyle} />
        </div>

        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faUserPlus}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Add Members</span>
          </div>
          <FontAwesomeIcon icon={faChevronRight} style={arrowStyle} />
        </div>

        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faLock}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Private</span>
          </div>

          {/* ON/OFF Toggle Switch */}
          <div
            onClick={handleTogglePrivate}
            style={{
              width: "45px",
              height: "25px",
              borderRadius: "20px",
              backgroundColor: isPrivate ? "#616161ff" : "#ccc",
              position: "relative",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: isPrivate ? "23px" : "3px",
                width: "19px",
                height: "19px",
                borderRadius: "50%",
                backgroundColor: "white",
                transition: "left 0.3s",
              }}
            ></div>
          </div>
        </div>

        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faRightFromBracket}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Leave</span>
          </div>
        </div>

        <div style={rowStyle}>
          <div style={iconTextStyle}>
            <FontAwesomeIcon
              icon={faTrash}
              style={{ fontSize: "1.5rem", color: "#3e3e3eff" }}
            />
            <span>Delete</span>
          </div>
        </div>
      </div>

      {/* Edit Title Modal */}
      {showEditTitle && (
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
              width: "85%",
              maxWidth: "400px",
              padding: "25px",
              textAlign: "center",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Edit Trip Title</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new title"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                marginBottom: "20px",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowEditTitle(false)}
                style={{
                  backgroundColor: "#ccc",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTitle}
                style={{
                  backgroundColor: "#3182ce",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryInfo;
