// src/SearchPage.js
import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "react-router-dom";

// Same BACKEND_URL logic as App.js 
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://t365-app.onrender.com");

// Lightweight Leaflet wrapper with graceful fallback (works even if react-leaflet isn't installed)
function LeafletMap({ places }) {
  try {
    // Will throw if react-leaflet isn't installed
    require.resolve("react-leaflet");
    const { MapContainer, TileLayer, Marker, Popup } = require("react-leaflet");

    const center = [
      places[0]?.lat ?? -37.8136, // Melbourne CBD fallback
      places[0]?.lng ?? 144.9631,
    ];

    return (
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-96 rounded-2xl overflow-hidden"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {places.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{p.address}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    );
  } catch {
    return (
      <div className="w-full h-96 rounded-2xl bg-gray-100 grid place-items-center text-gray-600">
        Map library not installed. Run <code>npm i react-leaflet leaflet</code>.
      </div>
    );
  }
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = (params.get("q") || "").toLowerCase();

  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");

  // Fetch posts (same grouping logic as App.js)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/posts`);
        const data = await res.json();
        if (!Array.isArray(data.posts)) return;
        const grouped = data.posts.reduce((acc, item) => {
          const id = item.post_id;
          if (!acc[id]) acc[id] = { ...item, media: [] };
          if (item.media_id) acc[id].media.push(item);
          return acc;
        }, {});
        setPosts(Object.values(grouped));
      } catch (e) {
        console.error("Failed to fetch posts for search:", e);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!query) return posts;
    return posts.filter(
      (p) =>
        (p.post_name && p.post_name.toLowerCase().includes(query)) ||
        (p.tags && p.tags.toLowerCase().includes(query)) ||
        (p.location && p.location.toLowerCase().includes(query))
    );
  }, [posts, query]);

  // Dummy places list (filter by query). Replace later.
  const places = [
    { id: "p1", name: "Humble Rays Cafe", lat: -37.8076, lng: 144.9631, address: "CBD, Melbourne" },
    { id: "p2", name: "Juju's Deli",       lat: -37.8136, lng: 144.9710, address: "Collins St, Melbourne" },
    { id: "p3", name: "Noodle Garden",     lat: -37.815,  lng: 144.956,  address: "Docklands, Melbourne" },
  ].filter((p) => p.name.toLowerCase().includes(query));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
      <h2 style={{ color: "#555", marginBottom: 8 }}>
        Search results for <span style={{ fontWeight: 600 }}>"{params.get("q") || ""}"</span>
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["Posts", "Users", "Itineraries", "Places"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #e5e5e5",
              background: activeTab === t ? "#fff" : "rgba(255,255,255,0.8)",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Posts" && (
        <div
          className="posts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {filteredPosts.length === 0 && (
            <p style={{ color: "#666", fontSize: 14 }}>No posts found.</p>
          )}
          {filteredPosts.map((p) => {
            const m = p.media?.[0];
            const isImg = m && m.type === "image";
            const src = m
              ? isImg
                ? `data:image/*;base64,${m.data}`
                : `data:video/*;base64,${m.data}`
              : null;

            return (
              <div
                key={p.post_id}
                style={{
                  borderRadius: 16,
                  border: "1px solid #e5e5e5",
                  overflow: "hidden",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  background: "#fff",
                }}
              >
                {src && isImg && (
                  <img
                    src={src}
                    alt={p.post_name}
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                  />
                )}
                {src && !isImg && (
                  <video
                    controls
                    src={src}
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                  />
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{p.post_name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {p.location || "N/A"} • {p.tags || "N/A"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "Users" && (
        <div style={{ color: "#666", fontSize: 14, padding: 8 }}>
          (Users results placeholder)
        </div>
      )}

      {activeTab === "Itineraries" && (
        <div style={{ color: "#666", fontSize: 14, padding: 8 }}>
          (Itineraries results placeholder)
        </div>
      )}

      {activeTab === "Places" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Suspense
            fallback={
              <div className="w-full h-96 rounded-2xl bg-gray-100 grid place-items-center text-gray-600">
                Loading map…
              </div>
            }
          >
            <LeafletMap places={places} />
          </Suspense>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {places.map((pl) => (
              <div
                key={pl.id}
                style={{
                  borderRadius: 14,
                  border: "1px solid #e5e5e5",
                  padding: 12,
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{pl.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{pl.address}</div>
              </div>
            ))}
            {places.length === 0 && (
              <p style={{ color: "#666", fontSize: 14 }}>No places matched.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
