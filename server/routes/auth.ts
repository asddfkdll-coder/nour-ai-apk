/**
 * @module routes/auth
 * @description Authentication routes for Nour AI
 * @security-note Passwords hashed with bcrypt (salt 12), JWT tokens (HS256, 24h)
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../db/sqlite.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @route POST /api/auth/register
 * @description Register new user account
 * @security-note Validates input, checks duplicates, hashes password
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = getDb();
    const existingUser = db.get("SELECT * FROM users WHERE email = ? OR username = ?", [email, username]);

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.run(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );

    const token = await generateToken({
      id: Number(result.lastInsertRowid),
      email,
      username
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: Number(result.lastInsertRowid), username, email }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * @route POST /api/auth/login
 * @description Authenticate user and return JWT
 * @security-note Constant-time comparison to prevent timing attacks
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = getDb();
    const user = db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
