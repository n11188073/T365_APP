import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const ItineraryInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>Itinerary Info Page</h1>
      <p>This is where we’ll show details or settings for itinerary {id}.</p>
    </div>
  );
};

export default ItineraryInfo;
