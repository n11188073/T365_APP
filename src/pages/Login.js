import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Login = () => {
  const [user, setUser] = useState(null);

  // Check session on page load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include", // include cookies
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      }
    };
    fetchMe();
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      // Send token to backend to create HttpOnly cookie
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // required for cookies
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        console.log("Logged in successfully:", data.user);
      } else {
        console.error("Login failed:", data.error);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {user ? (
        <>
          <h1>
            Welcome, <span style={{ color: "black" }}>{user.name}</span>
          </h1>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "1rem",
              backgroundColor: "#ff4d4d",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <h1>Login</h1>
          <p>Please log in with your Google account:</p>
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </>
      )}
    </div>
  );
};

export default Login;
