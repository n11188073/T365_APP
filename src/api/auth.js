const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; //-------------------------------------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = "708003752619-2c5sop4u7m30rg6pngpcumjacsfumobh.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/login", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user_id = payload.sub;
    const user_name = payload.name || payload.email;

    // Create JWT cookie
    const jwtToken = jwt.sign({ user_id, user_name }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.json({ user: { id: user_id, name: user_name } });
  } catch (err) {
    console.error("Invalid Google token:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out" });
});

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.user_id, name: payload.user_name };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { router, authenticate };
