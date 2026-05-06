const pool = require('../db');

// exports.getOffersByRadius = async (req, res) => {
//   try {
//     const { lat, lng, radius, search } = req.query;

//     if (!lat || !lng || !radius) {
//       return res.status(400).json({ error: "lat, lng, and radius are required" });
//     }

//     const sql = `
//       SELECT 
//         o.id, o.user_id, o.shop_id, o.title, o.description,
//         o.discount_percentage, o.discount_amount, o.coupon_code,
//         o.valid_from, o.valid_until, o.created_at,
//         s.shop_name, s.address, s.city, s.district, s.state, s.pincode,
//         s.latitude AS shop_latitude, s.longitude AS shop_longitude,
//         (6371 * acos(
//           cos(radians(?)) *
//           cos(radians(s.latitude)) *
//           cos(radians(s.longitude) - radians(?)) +
//           sin(radians(?)) *
//           sin(radians(s.latitude))
//         )) AS distance
//       FROM offers o
//       JOIN shops s ON o.shop_id = s.id
//       HAVING distance <= ?
//       ORDER BY distance ASC
//     `;

//     const params = [lat, lng, lat, radius];

//     const [offers] = await pool.query(sql, params);

//     console.log(offers);

//     res.json(offers);

//   } catch (err) {
//     console.error("Radius Filter Error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.getOffersByRadius = async (req, res) => {
//   try {
//     const { lat, lng, radius, search, category } = req.query;
//     console.log('ccc', req.query);

//     const searchText = `%${search || ''}%`;

//     const sql = `
//       SELECT 
//         o.id, o.user_id, o.shop_id, o.title, o.description,
//         o.discount_percentage, o.discount_amount, o.coupon_code,
//         o.valid_from, o.valid_until, o.created_at,
//         s.shop_name, s.address, s.city, s.district, s.state, s.pincode,
//         s.category_id,
//         (6371 * acos(
//           cos(radians(?)) *
//           cos(radians(s.latitude)) *
//           cos(radians(s.longitude) - radians(?)) +
//           sin(radians(?)) *
//           sin(radians(s.latitude))
//         )) AS distance
//       FROM offers o
//       JOIN shops s ON o.shop_id = s.id
//       WHERE 
//         CURDATE() BETWEEN o.valid_from AND o.valid_until
//         AND (
//           s.shop_name LIKE ? OR
//           o.title LIKE ? OR
//           o.coupon_code LIKE ?
//         )
//         AND (? IS NULL OR s.category_id = ?)
//       HAVING distance <= ?
//       ORDER BY distance ASC
//     `;

//     const params = [
//       lat,
//       lng,
//       lat,
//       searchText,
//       searchText,
//       searchText,
//       category || null,
//       category || null,
//       radius
//     ];

//     const [offers] = await pool.query(sql, params);

//     res.json(offers);

//   } catch (err) {
//     console.error("ERROR:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.getOffers = async (req, res) => {
//   try {
//     const {
//       lat,
//       lng,
//       radius = 5,
//       search = '',
//       category = '',
//       state = '',
//       district = '',
//       city = '',
//       page = 1,
//       limit = 10
//     } = req.query;

//     if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
//       return res.status(400).json({ message: 'Invalid location' });
//     }

//     const latitude  = parseFloat(lat);
//     const longitude = parseFloat(lng);
//     const radiusKm  = parseFloat(radius);
//     const pageNum   = parseInt(page);
//     const limitNum  = parseInt(limit);
//     const offset    = (pageNum - 1) * limitNum;

//     // ── WHERE clause ──
//     let where = `
//       WHERE (
//         6371 * acos(
//           cos(radians(?)) * cos(radians(s.latitude)) *
//           cos(radians(s.longitude) - radians(?)) +
//           sin(radians(?)) * sin(radians(s.latitude))
//         )
//       ) <= ?
//       AND s.active = 1
//       AND o.valid_until >= CURDATE()
//     `;

//     let params = [latitude, longitude, latitude, radiusKm];

//     // 🔍 Search
//     if (search.trim()) {
//       where += ` AND (o.title LIKE ? OR o.coupon_code LIKE ? OR s.shop_name LIKE ?)`;
//       const sVal = `%${search}%`;
//       params.push(sVal, sVal, sVal);
//     }

//     // 📂 Category
//     if (category) {
//       where += ` AND s.category_id = ?`;
//       params.push(category);
//     }

//     // ── FINAL SQL ──
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
//         s.shop_name,
//         s.active AS isOpen,

//         ROUND(
//           6371 * acos(
//             cos(radians(?)) * cos(radians(s.latitude)) *
//             cos(radians(s.longitude) - radians(?)) +
//             sin(radians(?)) * sin(radians(s.latitude))
//           ), 2
//         ) AS distance_km

//       FROM offers o
//       JOIN shops s ON o.shop_id = s.id

//       ${where}

//       ORDER BY distance_km ASC, o.created_at DESC
//       LIMIT ? OFFSET ?
//     `;

//     // ✅ IMPORTANT: distance params AGAIN + where params
//     const finalParams = [
//       latitude, longitude, latitude,   // for SELECT distance
//       ...params,                       // for WHERE
//       limitNum, offset
//     ];

//     const [rows] = await pool.query(sql, finalParams);

//     const data = rows.map(o => ({
//       id: o.id,
//       title: o.title,
//       shop_id: o.shop_id,
//       shop_name: o.shop_name,
//       description: o.description,
//       discount_percentage: o.discount_percentage,
//       discount_amount: o.discount_amount,
//       coupon_code: o.coupon_code,
//       valid_from: o.valid_from,
//       valid_until: o.valid_until,
//       created_at: o.created_at,
//       isOpen: o.isOpen === 1,
//       distance: `${o.distance_km} km away`,
//     }));

//     res.json({
//       success: true,
//       page: pageNum,
//       count: data.length,
//       data
//     });

//   } catch (error) {
//     console.error('GET OFFERS ERROR:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch offers',
//       error: error.message   // 👈 ADD THIS for debugging
//     });
//   }
// };


exports.getOffers = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 5,
      search = '',
      category = '',
      state = '',
      district = '',
      city = '',
      page = 1,
      limit = 10
    } = req.query;

    // ✅ Validate location only if NO location filters
    if (!city && !district && !state) {
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: 'Invalid location' });
      }
    }

    const latitude  = parseFloat(lat) || 0;
    const longitude = parseFloat(lng) || 0;
    const radiusKm  = parseFloat(radius);
    const pageNum   = parseInt(page);
    const limitNum  = parseInt(limit);
    const offset    = (pageNum - 1) * limitNum;

    // ─────────────────────────────────────────────
    // WHERE CONDITION (Dynamic)
    // ─────────────────────────────────────────────
    let where = ` WHERE s.active = 1 AND o.valid_until >= CURDATE() `;
    let params = [];

    // 🎯 PRIORITY FILTER
    if (city) {
      where += ` AND s.city_id = ?`;
      params.push(city);
    } else if (district) {
      where += ` AND s.district_id = ?`;
      params.push(district);
    } else if (state) {
      where += ` AND s.state_id = ?`;
      params.push(state);
    } else {
      // 📍 Default radius filter
      where += `
        AND (
          6371 * acos(
            cos(radians(?)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(s.latitude))
          )
        ) <= ?
      `;
      params.push(latitude, longitude, latitude, radiusKm);
    }

    // 🔍 Search filter
    if (search.trim()) {
      where += ` AND (o.title LIKE ? OR o.coupon_code LIKE ? OR s.shop_name LIKE ?)`;
      const sVal = `%${search}%`;
      params.push(sVal, sVal, sVal);
    }

    // 📂 Category filter
    if (category) {
      where += ` AND s.category_id = ?`;
      params.push(category);
    }

    // ─────────────────────────────────────────────
    // FINAL SQL
    // ─────────────────────────────────────────────
    const sql = `
      SELECT
        o.id,
        o.title,
        o.shop_id,
        o.description,
        o.discount_percentage,
        o.discount_amount,
        o.coupon_code,
        o.valid_from,
        o.valid_until,
        o.created_at,
        s.shop_name,
        s.active AS isOpen,

        ROUND(
          6371 * acos(
            cos(radians(?)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(s.latitude))
          ), 2
        ) AS distance_km

      FROM offers o
      JOIN shops s ON o.shop_id = s.id

      ${where}

      ORDER BY distance_km ASC, o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // ✅ FINAL PARAMS
    const finalParams = [
      latitude, longitude, latitude, // distance calculation
      ...params,
      limitNum,
      offset
    ];

    const [rows] = await pool.query(sql, finalParams);

    // ─────────────────────────────────────────────
    // RESPONSE FORMAT
    // ─────────────────────────────────────────────
    const data = rows.map(o => ({
      id: o.id,
      title: o.title,
      shop_id: o.shop_id,
      shop_name: o.shop_name,
      description: o.description,
      discount_percentage: o.discount_percentage,
      discount_amount: o.discount_amount,
      coupon_code: o.coupon_code,
      valid_from: o.valid_from,
      valid_until: o.valid_until,
      created_at: o.created_at,
      isOpen: o.isOpen === 1,
      distance: `${o.distance_km} km away`,
    }));

    res.json({
      success: true,
      page: pageNum,
      count: data.length,
      data
    });

  } catch (error) {
    console.error('GET OFFERS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers',
      error: error.message
    });
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
