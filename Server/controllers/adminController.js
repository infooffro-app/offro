const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new admin
exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please provide username and password" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM admin WHERE username = ?", [username]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO admin (username, password) VALUES (?, ?)", [username, hashedPassword]);

    res.json({ success: true, message: "✅ Admin user registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please provide username and password" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM admin WHERE username = ?", [username]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ id: admin.id, token, username: admin.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DB connection test
exports.checkDb = async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: "Database connected successfully" });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, message: "Database not connected" });
  }
};
