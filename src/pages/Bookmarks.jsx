import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Bookmarks() {
  const [images, setImages] = useState([]);
  const [showSquares, setShowSquares] = useState(true);

  useEffect(() => {
    // Fetch posts from backend
    const fetchImages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/posts"); // adjust port if needed
        // Find post with ID 8
        const post = res.data.posts.find(p => p.post_id === 8);
        if (post && post.media) {
          setImages(post.media);
        }
      } catch (err) {
        console.error("Error fetching images:", err);
      }
    };

    fetchImages();
  }, []);

  return (
    <div>
      {/* Bookmark Squares */}
      {showSquares && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 120px)",
            gridGap: 20,
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          {/* If we have images, show them; otherwise, show grey placeholders */}
          {images.length > 0
            ? images.map((img, index) => (
                <img
                  key={index}
                  src={`data:${img.type};base64,${img.data}`}
                  alt={img.filename || `Post image ${index}`}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 12,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                />
              ))
            : Array.from({ length: 9 }).map((_, index) => (
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
              ))}
        </div>
      )}
    </div>
  );
}
