import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://t365-app.onrender.com"
    : "http://localhost:5000";

const Login = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on page load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center" }}>
            <div className="spinner" style={styles.spinner}></div>
            <p style={{ color: "#555", marginTop: "1rem" }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {user ? (
          <>
            <h1 style={styles.title}>
              Welcome,{" "}
              <span style={{ color: "black", fontWeight: "600" }}>
                {user.name}
              </span>
            </h1>
            <p style={styles.subtitle}>You are now logged in.</p>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Login</h1>
            <p style={styles.subtitle}>Please log in with your Google account:</p>
            <div style={{ marginTop: "1rem" }}>
              <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Styling ---
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f7f7f7, #eaeaea)",
    padding: "2rem",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "3rem 2.5rem",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  title: {
    marginBottom: "1rem",
    fontSize: "2rem",
    color: "#222",
  },
  subtitle: {
    marginBottom: "1.5rem",
    color: "#555",
    fontSize: "1rem",
  },
  logoutButton: {
    marginTop: "1rem",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.2s ease, transform 0.1s ease",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #ddd",
    borderTop: "4px solid #ff4d4d",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
};

// Inject simple animation
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(
    `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`,
    styleSheet.cssRules.length
  );
}

export default Login;