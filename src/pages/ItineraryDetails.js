// src/pages/ItineraryDetails.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faComment,
  faBookmark,
  faPenToSquare,
  faCircleDot,
} from "@fortawesome/free-solid-svg-icons"; // some are regular, but you can load them from solid for now

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        {/* Left back button */}
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
          onClick={() => navigate(-1)} // go back to Calendar
          title="Back"
        />

        {/* Centered title */}
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            flex: 1,
          }}
        >
          Itinerary {id}
        </h1>

        {/* Right action icons */}
        <div
          style={{
            display: "flex",
            gap: "15px",
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
          />
          <FontAwesomeIcon
            icon={faCircleDot}
            style={{ fontSize: "1.2rem", cursor: "pointer" }}
            title="Options"
          />
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
          width: "85vw",
          margin: "0 auto",
        }}
      >
        <h2>Itinerary Details</h2>
        <p>You opened itinerary with ID: {id}</p>
      </div>
    </div>
  );
};

export default ItineraryDetails;
