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
    console.log(rows);
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

// Add shop
// exports.addShop = async (req, res) => {
//   const {
//     shopName,
//     description,
//     address,
//     state,
//     district,
//     city,
//     pincode,
//     phone,
//     email,
//     latitude,
//     longitude,
//     category_id
//   } = req.body;

//   console.log(req.body);

//   // 🔍 Validation
//   if (!shopName || !phone || !state || !district || !city || !category_id) {
//     return res.status(400).json({ error: "Required fields missing" });
//   }

//   try {
//     const userId = req.user.id; // from JWT

//     const [result] = await pool.query(
//       `INSERT INTO shops 
//       (user_id, shop_name, description, address, state, district, city, pincode, phone, email, latitude, longitude,category_id)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         userId,
//         shopName,
//         description,
//         address,
//         state,
//         district,
//         city,
//         pincode,
//         phone,
//         email,
//         latitude,
//         longitude,
//         category_id
//       ]
//     );

//     res.json({
//       message: "Shop added successfully",
//       shopId: result.insertId
//     });

//   } catch (err) {
//     console.error("Add Shop Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
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

// Add My Offer
// exports.addOffer = async (req, res) => {
//   const {
//     shop_id,
//     title,
//     description,
//     discountPercentage,
//     discountAmount,
//     couponCode,
//     validFrom,
//     validUntil,
//   } = req.body;

//   const validFromFormatted = new Date(validFrom).toISOString().split('T')[0];
// const validUntilFormatted = new Date(validUntil).toISOString().split('T')[0];
//   console.log(req.body);

//   if (!title || !validFrom || !validUntil) {
//     return res.status(400).json({ error: "Required fields missing" });
//   }

//   try {
//     const userId = req.user.id;

//     // 🔥 Get shop first
//     // const [shops] = await pool.query(
//     //   "SELECT id FROM shops WHERE user_id = ? LIMIT 1",
//     //   [userId]
//     // );

//     // if (shops.length === 0) {
//     //   return res.status(400).json({ error: "Please add shop first" });
//     // }

//     // const shopId = shops[0].id;

//     // 🔥 Insert offer
//     const [result] = await pool.query(
//       `INSERT INTO offers 
//       (user_id, shop_id, title, description, discount_percentage, discount_amount, coupon_code, valid_from, valid_until)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         userId,
//         shop_id,
//         title,
//         description,
//         discountPercentage || null,
//         discountAmount || null,
//         couponCode,
//         validFromFormatted ,
//         validUntilFormatted ,
//       ]
//     );

//     res.json({
//       message: "Offer added successfully",
//       offerId: result.insertId,
//     });

//   } catch (err) {
//     console.error("Add Offer Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

//Update Offer
// exports.updateOffer = async (req, res) => {
//   const { id } = req.params;
//   const {
//     shop_id,
//     title,
//     description,
//     discountPercentage,
//     discountAmount,
//     couponCode,
//     validFrom,
//     validUntil,
//   } = req.body;

//   console.log("Dadsad");

//   if (!title || !validFrom || !validUntil) {
//     return res.status(400).json({ error: "Required fields missing" });
//   }

//   try {
//     const userId = req.user.id;

//     const validFromFormatted = new Date(validFrom).toISOString().split('T')[0];
//     const validUntilFormatted = new Date(validUntil).toISOString().split('T')[0];

//     // 🔒 Check offer belongs to this user
//     const [existing] = await pool.query(
//       "SELECT id FROM offers WHERE id = ? AND user_id = ?",
//       [id, userId]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({ error: "Offer not found or unauthorized" });
//     }

//     // 🔥 Update offer
//     await pool.query(
//       `UPDATE offers SET
//         shop_id = ?,
//         title = ?,
//         description = ?,
//         discount_percentage = ?,
//         discount_amount = ?,
//         coupon_code = ?,
//         valid_from = ?,
//         valid_until = ?
//       WHERE id = ? AND user_id = ?`,
//       [
//         shop_id,
//         title,
//         description,
//         discountPercentage || null,
//         discountAmount || null,
//         couponCode,
//         validFromFormatted,
//         validUntilFormatted,
//         id,
//         userId,
//       ]
//     );

//     res.json({ message: "Offer updated successfully" });

//   } catch (err) {
//     console.error("Update Offer Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// Get shop Categories
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

//Get Myoffers
// exports.getMyOffers = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // query params
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const offset = (page - 1) * limit;

//     // 🔍 Search condition
//     const searchQuery = `
//       AND (
//         o.title LIKE ? OR 
//         o.coupon_code LIKE ? OR 
//         s.shop_name LIKE ?
//       )
//     `;

//     const searchValue = `%${search}%`;

//     // 🧠 SQL Query
//     const sql = `
//       SELECT 
//         o.id,
//         o.title,
//         o.shop_id,
//         o.description,
//         o.discount_percentage,
//         o.discount_amount,
//         o.coupon_code,
//         o.valid_from,
//         o.valid_until,
//         o.created_at,
//         s.shop_name
//       FROM offers o
//       JOIN shops s ON o.shop_id = s.id
//       WHERE s.user_id = ?
//       ${search ? searchQuery : ''}
//       ORDER BY o.created_at DESC
//       LIMIT ? OFFSET ?
//     `;

//     // params
//     const params = search
//       ? [userId, searchValue, searchValue, searchValue, limit, offset]
//       : [userId, limit, offset];

//     const [rows] = await pool.query(sql, params);

//      res.json(rows);

//   } catch (error) {
//     console.error('MY OFFERS ERROR:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


exports.getMyShops = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('sasd', req.user.id)
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
  console.log("addssad");
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

    console.log("checkResult", checkResult);

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

