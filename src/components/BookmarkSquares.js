import React, { useEffect, useState } from "react";
import axios from "axios";

const BookmarkSquares = ({ itineraryId, showSquares }) => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (!itineraryId) return;
    const fetchBookmarks = async () => {
      try {
        const res = await axios.get(`/api/itineraries/bookmarkPosts?itinerary_id=${itineraryId}`);
        if (res.data.success) setBookmarks(res.data.bookmarks);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
      }
    };
    fetchBookmarks();
  }, [itineraryId]);

  if (!showSquares) return null;

  // Get the first media Base64 string and type
  const firstBookmark = bookmarks[0];
  const firstMedia = firstBookmark?.media?.[0];
  const firstMediaBase64 = firstMedia?.data;
  const firstMediaType = firstMedia?.type;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 120px)",
        gridGap: 20,
        justifyContent: "center",
        marginTop: 20,
      }}
    >
      {Array.from({ length: 9 }).map((_, index) => {
        if (index === 0 && firstMediaBase64) {
          // First square: actual image from DB
          return (
            <img
              key={index}
              src={`data:${firstMediaType};base64,${firstMediaBase64}`}
              alt={firstMedia?.filename || "Bookmark Image"}
              style={{ width: 120, height: 120, borderRadius: 12, objectFit: "cover", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
            />
          );
        }
        // Other squares: placeholders
        return (
          <div
            key={index}
            style={{
              width: 120,
              height: 120,
              backgroundColor: "grey",
              borderRadius: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          />
        );
      })}
    </div>
  );
};

export default BookmarkSquares;
