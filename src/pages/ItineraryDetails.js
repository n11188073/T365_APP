// src/pages/ItineraryDetails.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faComment,
  faBookmark,
  faPenToSquare,
  faCircleDot,
  faClock,
  faKeyboard,
  faMap,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const activities = [
    { time: "12:00pm", title: "Lunch at Cafe" },
    { time: "1:30pm", title: "Visit Museum" },
  ];

  return (
    <div style={{ padding: "20px", height: "100vh", overflowY: "auto" }}>
      {/* Header row */}
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

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            flex: 1,
          }}
        >
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

      {/* Edit mode: Add Event button */}
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

      {/* Timeline wrapper */}
      <div
        style={{
          width: "85vw",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Vertical timeline line */}
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
          ></div>
        )}

        {activities.map((activity, index) => (
          <div key={index} style={{ marginBottom: "30px", position: "relative" }}>
            {/* Time + circle row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
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
                {activity.time}
              </span>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{activity.title}</h2>
              <p>Details for {activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add Event */}
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
            {/* Cancel + Save */}
            <span
              style={{
                position: "absolute",
                top: "15px",
                left: "20px",
                cursor: "pointer",
                color: "black",
                fontSize: "1.2rem",
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
                fontSize: "1.2rem",
              }}
              onClick={() => setShowAddEventModal(false)} // placeholder
            >
              Save
            </span>

            {/* Input boxes */}
            <div
              style={{
                marginTop: "60px",
                display: "flex",
                flexDirection: "column",
                gap: "25px",
              }}
            >
              {/* Time */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  padding: "16px",
                  fontSize: "1.5rem", // 150% size
                }}
                onClick={() => document.getElementById("event-time").focus()}
              >
                <FontAwesomeIcon icon={faClock} style={{ marginRight: "15px", color: "#555" }} />
                <input
                  id="event-time"
                  type="time"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    flex: 1,
                    fontSize: "1.5rem", // bigger text
                  }}
                />
              </div>

              {/* Title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  padding: "16px",
                  fontSize: "1.5rem",
                }}
              >
                <FontAwesomeIcon icon={faKeyboard} style={{ marginRight: "15px", color: "#555" }} />
                <input
                  type="text"
                  placeholder="Activity Title"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    flex: 1,
                    fontSize: "1.5rem",
                  }}
                />
              </div>

              {/* Location */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  padding: "16px",
                  fontSize: "1.5rem",
                }}
              >
                <FontAwesomeIcon icon={faMap} style={{ marginRight: "15px", color: "#555" }} />
                <input
                  type="text"
                  placeholder="Location"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    flex: 1,
                    fontSize: "1.5rem",
                  }}
                />
              </div>

              {/* Notes */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  padding: "16px",
                  fontSize: "1.5rem",
                }}
              >
                <FontAwesomeIcon icon={faFileLines} style={{ marginRight: "15px", marginTop: "6px", color: "#555" }} />
                <textarea
                  placeholder="Notes"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    flex: 1,
                    fontSize: "1.5rem",
                    resize: "none",
                    minHeight: "80px",
                  }}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetails;
