const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/mailer');

// Get all users
exports.getUsers = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
  res.json(rows);
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please provide email and password" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }
    const user = rows[0];
   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (user.is_active === 0) {
        return res.status(403).json({ error: 'Account is inactive. Contact support.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ id: user.id, token, email: user.email, name : user.name });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add user
// exports.addUser = async (req, res) => {
//   const { name, email, mobile, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   try {
//     const [result] = await pool.query(
//       'INSERT INTO users (name, mobile, email, password) VALUES (?, ?, ?, ?)',
//       [name, mobile, email, hashedPassword]
//     );

//     res.status(201).json({
//       id: result.insertId,
//       name,
//       mobile,
//       email,
//     });

//   } catch (err) {
//     res.status(400).json({
//       error: err.message,
//     });
//   }
// };

// exports.addUser = async (req, res) => {
//   try {
//     const { name, email, mobile, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     await pool.query(
//       `INSERT INTO users (name, email, mobile, password, otp, otp_expiry)
//        VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
//       [name, email, mobile, hashedPassword, otp]
//     );

//     await sendOTP(email, otp);

//     res.json({ message: 'OTP sent', email });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Register failed' });
//   }
// };

exports.addUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO users (name, email, mobile, password, otp, otp_expiry)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [name, email, mobile, hashedPassword, otp]
    );

    await sendOTP(email, otp);

    return res.json({ message: 'OTP sent', email });

  } catch (err) {
    console.error(err);

    // ✅ Handle duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage.includes('email')) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (err.sqlMessage.includes('mobile')) {
        return res.status(400).json({ error: 'Mobile number already registered' });
      }

      return res.status(400).json({ error: 'User already exists' });
    }

    return res.status(500).json({ error: 'Register failed' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, id]);
    res.json({ id, name, email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=?', [req.params.id]);
  res.json({ success: true });
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [users] = await pool.query(
      `SELECT * FROM users 
       WHERE email = ? AND otp = ? AND otp_expiry > NOW()`,
      [email, otp]
    );

     
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const user = users[0];

    // Check expiry
    if (new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    await pool.query(
      `UPDATE users SET otp=NULL, otp_expiry=NULL WHERE email=?`,
      [email]
    );

    res.json({ message: 'OTP Verified' });

  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};


exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `UPDATE users 
       SET otp=?, otp_expiry=DATE_ADD(NOW(), INTERVAL 5 MINUTE)
       WHERE email=?`,
      [otp, email]
    );

    await sendOTP(email, otp);

    res.json({ message: 'OTP resent' });

  } catch (err) {
    res.status(500).json({ error: 'Resend failed' });
  }
};

// 1. GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
 
    const sql = `
      SELECT id, name, email, mobile, created_at
      FROM users
      WHERE id = ?
    `;
 
    const [rows] = await pool.query(sql, [userId]);
 
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    res.json({
      success: true,
      data: rows[0],
    });
 
  } catch (error) {
    console.error('GET PROFILE ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
 
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
 
    const normalizedEmail = email.toLowerCase().trim();
 
    // Check user exists
    const [rows] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [normalizedEmail]
    );
 
    // ✅ FIX: Return 404 so frontend stays on Step 1 and shows error
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }
 
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
 
    // Delete old OTP for this email
    await pool.query(
      `DELETE FROM password_resets WHERE email = ?`,
      [normalizedEmail]
    );
 
    // Save new OTP
    await pool.query(
      `INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)`,
      [normalizedEmail, otp, expiresAt]
    );
 
    // Send OTP email
    await sendOTP(normalizedEmail, otp);
 
    console.log(`OTP sent to ${normalizedEmail}: ${otp}`); // Remove in production
 
    res.json({ success: true, message: 'OTP sent to your email' });
 
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

//Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
 
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' });
    }
 
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
 
    // Verify OTP again (security check)
    const [rows] = await pool.query(
      `SELECT * FROM password_resets WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );
 
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
 
    if (new Date() > new Date(rows[0].expires_at)) {
      await pool.query(`DELETE FROM password_resets WHERE email = ?`, [email]);
      return res.status(400).json({ message: 'OTP has expired. Please start again' });
    }
 
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
 
    // Update password
    await pool.query(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?`,
      [hashedPassword, email]
    );
 
    // Delete OTP record (one-time use)
    await pool.query(
      `DELETE FROM password_resets WHERE email = ?`,
      [email]
    );
 
    res.json({
      success: true,
      message: 'Password reset successfully. Please login.',
    });
 
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};


//Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
 
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }
 
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
 
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }
 
    // Get current password hash from DB
    const [rows] = await pool.query(
      `SELECT password FROM users WHERE id = ?`,
      [userId]
    );
 
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
 
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
 
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
 
    // Update password in DB
    await pool.query(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
      [hashedPassword, userId]
    );
 
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
 
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};
 
// forgotVerifyOtp 
exports.forgotVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
 
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
 
    // Find OTP record
    const [rows] = await pool.query(
      `SELECT * FROM password_resets WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );
 
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
 
    const record = rows[0];
 
    // Check if OTP is expired
    if (new Date() > new Date(record.expires_at)) {
      await pool.query(`DELETE FROM password_resets WHERE email = ?`, [email]);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
    }
 
    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
 
  } catch (error) {
    console.error('VERIFY OTP ERROR:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};



