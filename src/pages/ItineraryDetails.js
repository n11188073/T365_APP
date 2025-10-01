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
} from "@fortawesome/free-solid-svg-icons";

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  // Mock activities
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
          {editMode ? `Edit Itinerary ${id}` : `Itinerary ${id}`}
        </h1>

        {editMode ? (
          <span
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#0073b1",
              fontWeight: "500",
            }}
            onClick={() => setEditMode(false)}
          >
            Save
          </span>
        ) : (
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
              onClick={() => setEditMode(true)}
            />
            <FontAwesomeIcon
              icon={faCircleDot}
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
              title="Options"
            />
          </div>
        )}
      </div>

      {/* Timeline wrapper */}
      <div style={{ width: "85vw", margin: "0 auto", position: "relative" }}>
        {/* Vertical timeline line */}
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

        {/* Add Event card at the top in edit mode */}
        {editMode && (
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <div
              style={{
                padding: "20px",
                backgroundColor: "#90cdf4",
                borderRadius: "12px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                textAlign: "center",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Add event</h2>
            </div>
          </div>
        )}

        {/* Map over activities */}
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
              {/* Circle aligned to text */}
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
              <span style={{ fontSize: "1rem", color: "#555" }}>
                {activity.time}
              </span>
            </div>

            {/* Card */}
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
    </div>
  );
};

export default ItineraryDetails;
