import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// Automatically detect API URL
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com" // no trailing slash
    : "http://localhost:5000"; // Express server port


const Login = () => {
  const [user, setUser] = useState(null);

  // Load stored user from localStorage when page loads
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle login success
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    localStorage.setItem("google_token", token);

    const decoded = jwtDecode(token);
    const user_id = decoded.sub;
    const user_name = decoded.name || decoded.email;

    const newUser = { id: user_id, name: user_name };
    setUser(newUser);

    localStorage.setItem("user", JSON.stringify(newUser));

    // Save to backend
    try {
      const res = await fetch(`${API_BASE}/saveUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: user_name, email: decoded.email })
      });

      const data = await res.json();
      console.log("Server response:", data);
    } catch (err) {
      console.error("Failed to save user:", err);
    }

  };

  // Handle login error
  const handleError = () => {
    console.error("Google Login Failed");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("google_token");
    localStorage.removeItem("user");
    setUser(null);
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
              cursor: "pointer"
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
