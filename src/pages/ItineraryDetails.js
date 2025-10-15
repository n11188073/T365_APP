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
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faClock,
  faKeyboard,
  faMap,
  faFileLines,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";

import { fetchWeather } from "../api/fetchWeather";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com/api/itineraries"
    : "http://localhost:5000/api/itineraries";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [itinerary, setItinerary] = useState(null);

  const [cardTime, setCardTime] = useState("");
  const [cardDate, setCardDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);
  const [weather, setWeather] = useState(null);

  const getWeatherColor = (main) => {
    switch (main) {
      case "Clear": return "#87CEEB";
      case "Clouds": return "#B0C4DE";
      case "Rain": return "#778899";
      case "Thunderstorm": return "#4B0082";
      case "Drizzle": return "#A9A9A9";
      case "Snow": return "#E0FFFF";
      case "Mist":
      case "Fog":
      case "Haze": return "#C0C0C0";
      default: return "#90cdf4";
    }
  };

  // Fetch itinerary
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.itinerary) {
          setItinerary(data.itinerary);
          if (data.itinerary.date_start) setSelectedDate(data.itinerary.date_start);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchItinerary();
  }, [id]);

  // Fetch weather
  useEffect(() => {
    const loadWeather = async () => {
      if (!itinerary || !itinerary.destination) return;
      try {
        const data = await fetchWeather(itinerary.destination);
        setWeather(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadWeather();
  }, [itinerary]);

  // Fetch itinerary cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${API_BASE}/itineraryCards/${id}`, { credentials: "include" });
        const data = await res.json();
        if (data.cards) {
          const sorted = data.cards.sort((a, b) => a.card_time.localeCompare(b.card_time));
          setActivities(sorted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCards();
  }, [id]);

  // Filter activities by selected date
  useEffect(() => {
    if (!selectedDate) return setFilteredActivities(activities);
    setFilteredActivities(activities.filter(a => !a.card_date || a.card_date === selectedDate));
  }, [selectedDate, activities]);

  // Save new card
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
          card_date: cardDate || null,
        }),
      });
      const data = await res.json();
      if (data.card_id) {
        setActivities(prev => [...prev, { card_id: data.card_id, itinerary_id: id, location_name: locationName, location_address: locationAddress, notes, order_index: prev.length, card_time: cardTime, card_date: cardDate || null }].sort((a, b) => a.card_time.localeCompare(b.card_time)));
        closeModal();
      } else {
        console.error("Error saving card:", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update existing card
  const handleUpdateCard = async () => {
    try {
      const res = await fetch(`${API_BASE}/updateItineraryCard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          card_id: editingCardId,
          location_name: locationName,
          location_address: locationAddress,
          notes,
          card_time: cardTime,
          card_date: cardDate,
        }),
      });
      if (res.ok) {
        setActivities(prev =>
          prev.map(a =>
            a.card_id === editingCardId
              ? { ...a, location_name: locationName, location_address: locationAddress, notes, card_time: cardTime, card_date: cardDate }
              : a
          )
        );
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal for editing
  const handleEditClick = (card) => {
    setEditingCardId(card.card_id);
    setCardTime(card.card_time || "");
    setCardDate(card.card_date || "");
    setLocationName(card.location_name || "");
    setLocationAddress(card.location_address || "");
    setNotes(card.notes || "");
    setShowEventModal(true);
  };

  // Delete card
  const handleDeleteCard = async (card_id) => {
    try {
      const res = await fetch(`${API_BASE}/deleteItineraryCard/${card_id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setActivities(prev => prev.filter(a => a.card_id !== card_id));
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowEventModal(false);
    setEditingCardId(null);
    setCardTime("");
    setCardDate("");
    setLocationName("");
    setLocationAddress("");
    setNotes("");
  };

  const generateDates = () => {
    if (!itinerary?.date_start || !itinerary?.date_end) return [];
    const start = new Date(itinerary.date_start);
    const end = new Date(itinerary.date_end);
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const dates = generateDates();

  return (
    <div style={{ padding: 20, height: "100vh", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ width: "85vw", margin: "0 auto", marginTop: "3%", marginBottom: "3%", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <FontAwesomeIcon
          icon={faChevronLeft}
          style={{ cursor: "pointer", fontSize: "1.5rem", position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}
          onClick={() => navigate(-1)}
          title="Back"
        />
        <h1 style={{ margin: 0, textAlign: "center", flex: 1 }}>
          {isEditing ? `Edit ${itinerary?.title || `Itinerary ${id}`}` : itinerary?.title || `Itinerary ${id}`}
        </h1>
        {!isEditing ? (
          <div style={{ display: "flex", gap: 30, position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <FontAwesomeIcon icon={faComment} style={{ fontSize: "1.2rem", cursor: "pointer" }} title="Comments" />
            <FontAwesomeIcon icon={faBookmark} style={{ fontSize: "1.2rem", cursor: "pointer" }} title="Bookmark" />
            <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: "1.2rem", cursor: "pointer" }} title="Edit" onClick={() => setIsEditing(true)} />
            <FontAwesomeIcon icon={faCircleDot} style={{ fontSize: "1.2rem", cursor: "pointer" }} title="Options" onClick={() => navigate(`/ItineraryInfo/${id}`)} />
          </div>
        ) : (
          <span style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem", cursor: "pointer", color: "blue" }} onClick={() => setIsEditing(false)}>
            Save
          </span>
        )}
      </div>

      {/* Dates */}
      {dates.length > 0 && (
        <div style={{ display: "flex", overflowX: "auto", gap: 20, marginBottom: 20, width: "85vw", margin: "0 auto", padding: 20 }}>
          {dates.map(d => {
            const dateStr = d.toISOString().split("T")[0];
            const isSelected = dateStr === selectedDate;
            return (
              <div key={dateStr} style={{ textAlign: "center" }}>
                <div>{weekdays[d.getDay()]}</div>
                <div onClick={() => setSelectedDate(dateStr)} style={{ width: 50, height: 50, lineHeight: "50px", backgroundColor: isSelected ? "#cde5f4ff" : "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", borderRadius: 8, cursor: "pointer", marginTop: 5, userSelect: "none" }}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weather */}
      {weather && (
        <div style={{ width: "85vw", margin: "0 auto", marginBottom: 20, padding: "15px 20px", backgroundColor: getWeatherColor(weather.weather[0].main), borderRadius: 12, color: "#fff", boxShadow: "0px 2px 6px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
            <span>{weather.name}</span>
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} style={{ width: 40, height: 40 }} />
          </div>
          <div style={{ textAlign: "left", fontSize: "1.8rem", fontWeight: "bold" }}>
            {Math.round(weather.main.temp)}°C — {weather.weather[0].description}
          </div>
        </div>
      )}

      {/* Add Event Button */}
      {isEditing && (
        <div onClick={() => setShowEventModal(true)} style={{ width: "85vw", margin: "0 auto", marginBottom: 20, padding: 15, textAlign: "center", backgroundColor: "#90cdf4", borderRadius: 12, cursor: "pointer", fontSize: "1.2rem", fontWeight: "bold" }}>
          Add Event
        </div>
      )}

      {/* Timeline */}
      <div style={{ width: "85vw", margin: "0 auto", position: "relative" }}>
        {filteredActivities.length > 0 && <div style={{ position: "absolute", top: 0, left: "-20px", width: 2, height: "100%", backgroundColor: "#ccc" }} />}
        {filteredActivities.map(activity => (
          <div key={activity.card_id} style={{ marginBottom: 30, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#90cdf4", border: "2px solid white", boxShadow: "0 0 3px rgba(0,0,0,0.2)", marginRight: 8, marginLeft: -28, flexShrink: 0 }} />
              <span style={{ fontSize: "1.2rem", color: "#555" }}>{activity.card_time}</span>
            </div>
            <div style={{ padding: 20, backgroundColor: "white", borderRadius: 12, boxShadow: "0px 4px 8px rgba(0,0,0,0.2)", position: "relative" }}>
              <h2 style={{ marginTop: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{activity.location_name}</span>
                {isEditing && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <FontAwesomeIcon icon={faPenToSquare} style={{ cursor: "pointer", color: "blue" }} title="Edit card" onClick={() => handleEditClick(activity)} />
                    <FontAwesomeIcon icon={faCircleXmark} style={{ cursor: "pointer", color: "red" }} title="Delete card" onClick={() => handleDeleteCard(activity.card_id)} />
                  </div>
                )}
              </h2>
              <p>{activity.location_address}</p>
              <p>{activity.notes}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: 12, width: "90%", height: "90%", padding: 20, position: "relative", overflowY: "auto" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={closeModal}>Cancel</span>
              <span style={{ cursor: "pointer", fontWeight: "bold", color: "#90cdf4" }} onClick={editingCardId ? handleUpdateCard : handleSaveCard}>{editingCardId ? "Update" : "Save"}</span>
            </div>

            {/* Input Fields */}
            <div style={{ display: "grid", gap: 20 }}>
              {/* Time */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 15, boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }}>
                <FontAwesomeIcon icon={faClock} style={{ marginRight: 10, fontSize: "150%" }} />
                <input type="time" value={cardTime} onChange={(e) => setCardTime(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }} />
              </div>

              {/* Date */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 15, boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }}>
                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: 10, fontSize: "150%" }} />
                <input type="date" value={cardDate || selectedDate || ""} onChange={(e) => setCardDate(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }} />
              </div>

              {/* Location Name */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 15, boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }}>
                <FontAwesomeIcon icon={faKeyboard} style={{ marginRight: 10, fontSize: "150%" }} />
                <input type="text" placeholder="Location Name" value={locationName} onChange={(e) => setLocationName(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }} />
              </div>

              {/* Location Address */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 15, boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }}>
                <FontAwesomeIcon icon={faMap} style={{ marginRight: 10, fontSize: "150%" }} />
                <input type="text" placeholder="Location Address" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1 }} />
              </div>

              {/* Notes */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f9f9f9", borderRadius: 12, padding: 15, boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }}>
                <FontAwesomeIcon icon={faFileLines} style={{ marginRight: 10, fontSize: "150%" }} />
                <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ border: "none", outline: "none", background: "transparent", fontSize: "1.2rem", flex: 1, resize: "none" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetails;
