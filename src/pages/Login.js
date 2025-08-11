import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

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
      await fetch("http://localhost:3000/api/saveUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, user_name })
      });
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
          <h1>Welcome, <span style={{ color: "black" }}>{user.name}</span></h1>
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
