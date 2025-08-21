import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// Automatically detect API URL
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Login = ({ user, setUser }) => {
  // Check session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          method: "GET",
          credentials: "include", // send cookies
        });
        const data = await res.json();
        if (data.loggedIn) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to check session:", err);
      }
    };
    checkSession();
  }, [setUser]);

  // Handle Google login success
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    const user_id = decoded.sub;
    const user_name = decoded.name || decoded.email;

    try {
      const res = await fetch(`${API_BASE}/saveUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookie
        body: JSON.stringify({ user_id, user_name }),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (data.user) {
        setUser(data.user); // comes from session
      }
    } catch (err) {
      console.error("Failed to save user:", err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include", // send cookies
      });
      const data = await res.json();
      console.log(data.message);
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
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
