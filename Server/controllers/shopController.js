const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Get all users
exports.getUsers = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
  res.json(rows);
};

// get states
exports.getStates = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM states");

    res.json(rows);
  } catch (err) {
    console.error("State fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// get districts by stateId
exports.getDistricts = async (req, res) => {
  const stateId  = req.params.stateId;
  if (!stateId) {
    return res.status(400).json({ error: "State ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM districts WHERE state_id = ?",
      [stateId]
    );

    res.json(rows);
  } catch (err) {
    console.error("District fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// get cities by districtId
exports.getCities = async (req, res) => {
  const districtId  = req.params.districtId;

  if (!districtId) {
    return res.status(400).json({ error: "District ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM cities WHERE district_id = ?",
      [districtId]
    );

    res.json(rows);
  } catch (err) {
    console.error("City fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addShop = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shopName, description, address, city, district, state,
      city_id, district_id, state_id,           // ✅ Destructure IDs
      pincode, phone, email, latitude, longitude, category_id
    } = req.body;
 
    const sql = `
      INSERT INTO shops 
        (user_id, shop_name, description, address, city, district, state,
         city_id, district_id, state_id,
         pincode, phone, email, latitude, longitude, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
 
    const params = [
      userId, shopName, description, address, city, district, state,
      city_id || null, district_id || null, state_id || null,  // ✅ Save IDs
      pincode, phone, email, latitude, longitude, category_id
    ];
 
    const [result] = await pool.query(sql, params);
 
    res.status(201).json({
      success: true,
      message: 'Shop added successfully',
      shopId: result.insertId,
    });
 
  } catch (error) {
    console.error('ADD SHOP ERROR:', error);
    res.status(500).json({ error: 'Failed to add shop' });
  }
};

//Get My shop
exports.getMyShop = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT * FROM shops WHERE user_id = ? AND active = 1 LIMIT 100",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No shop found" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Get Shop Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, icon FROM categories WHERE status = 1"
    );
    res.json(rows);
  } catch (err) {
    console.error("Category Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getMyShops = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT id, user_id, shop_name, description, address, 
             city, district, state, pincode, phone, email,
             latitude, longitude, category_id, created_at
      FROM shops
      WHERE user_id = ? AND active = 1
      ORDER BY created_at DESC
    `;

    const [shops] = await pool.query(sql, [userId]);

    res.json({
      success: true,
      data: shops
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch shops' });
  }
};


exports.getShopById = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.id;

    const sql = `
      SELECT * FROM shops
      WHERE id = ? AND user_id = ? AND active = 1
    `;

    const [shops] = await pool.query(sql, [shopId, userId]);

    if (shops.length === 0) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({
      success: true,
      data: shops[0]
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to fetch shop' });
  }
};



exports.updateShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.id;
    const { shopName, description, address, city, district, 
            state, pincode, phone, email, latitude, longitude, category_id } = req.body;

    // Verify ownership
    const checkSql = 'SELECT id FROM shops WHERE id = ? AND user_id = ? AND active = 1';
    const [checkResult] = await pool.query(checkSql, [shopId, userId]);

    if (checkResult.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updateSql = `
      UPDATE shops SET
        shop_name = ?,
        description = ?,
        address = ?,
        city = ?,
        district = ?,
        state = ?,
        pincode = ?,
        phone = ?,
        email = ?,
        latitude = ?,
        longitude = ?,
        category_id = ?,
        updated_at = NOW()
      WHERE id = ? AND user_id = ?
    `;

    const params = [
      shopName, description, address, city, district, state,
      pincode, phone, email, latitude, longitude, category_id,
      shopId, userId
    ];

    await pool.query(updateSql, params);

    res.json({
      success: true,
      message: 'Shop updated successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to update shop' });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const checkSql = 'SELECT id FROM shops WHERE id = ? AND user_id = ?';
    const [checkResult] = await pool.query(checkSql, [shopId, userId]);

    if (checkResult.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete offers first (due to foreign key)
    await pool.query('DELETE FROM offers WHERE shop_id = ?', [shopId]);

    // Delete shop
    await pool.query('UPDATE shops SET active = 0 WHERE id = ? AND user_id = ?',[shopId, userId]);

    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Failed to delete shop' });
  }
};

