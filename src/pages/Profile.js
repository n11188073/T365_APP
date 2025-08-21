import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Profile = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Function to check session
  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        method: "GET",
        credentials: "include", // send cookies
      });

      console.log("✅ /me response status:", res.status);

      const data = await res.json();
      console.log("📄 /me response data:", data);

      if (data.loggedIn) {
        setUser(data.user);
        console.log("🟢 User is logged in:", data.user);
      } else {
        setUser(null);
        console.log("🔴 User is not logged in");
      }
    } catch (err) {
      console.error("❌ Failed to check session:", err);
      setUser(null);
    }
  };

  // Check session on mount and poll every 30 seconds
  useEffect(() => {
    checkSession();
    const interval = setInterval(() => {
      checkSession();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [setUser]);

  if (!user) {
    return (
      <div className="page relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Link
            to="/login"
            className="text-white text-xl underline hover:text-blue-300 transition"
          >
            Login to view profile page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page flex flex-col items-center p-6">
      <div className="w-24 h-24 rounded-full bg-gray-300 mb-4" />
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600 mt-2">Welcome to your profile page!</p>
    </div>
  );
};

export default Profile;
