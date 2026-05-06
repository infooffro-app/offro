const pool = require('../db');



// Add My Offer
exports.addOffer = async (req, res) => {
  const {
    shop_id,
    title,
    description,
    discountPercentage,
    discountAmount,
    couponCode,
    validFrom,
    validUntil,
  } = req.body;

  const validFromFormatted = new Date(validFrom).toISOString().split('T')[0];
  const validUntilFormatted = new Date(validUntil).toISOString().split('T')[0];
  console.log(req.body);

  if (!title || !validFrom || !validUntil) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const userId = req.user.id;

    // 🔥 Insert offer
    const [result] = await pool.query(
      `INSERT INTO offers 
      (user_id, shop_id, title, description, discount_percentage, discount_amount, coupon_code, valid_from, valid_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        shop_id,
        title,
        description,
        discountPercentage || null,
        discountAmount || null,
        couponCode,
        validFromFormatted,
        validUntilFormatted,
      ]
    );

    res.json({
      message: "Offer added successfully",
      offerId: result.insertId,
    });

  } catch (err) {
    console.error("Add Offer Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//Update Offer
exports.updateOffer = async (req, res) => {

  const { id } = req.params;
  const {
    shop_id,
    title,
    description,
    discountPercentage,
    discountAmount,
    couponCode,
    validFrom,
    validUntil,
  } = req.body;

  if (!title || !validFrom || !validUntil) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const userId = req.user.id;
    const validFromFormatted = new Date(validFrom).toISOString().split('T')[0];
    const validUntilFormatted = new Date(validUntil).toISOString().split('T')[0];

    // 🔒 Check offer belongs to this user
    const [existing] = await pool.query(
      "SELECT id FROM offers WHERE id = ? AND user_id = ?",
      [Number(id), userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Offer not found or unauthorized" });
    }

    // 🔥 Update offer
    await pool.query(
      `UPDATE offers SET
        shop_id = ?,
        title = ?,
        description = ?,
        discount_percentage = ?,
        discount_amount = ?,
        coupon_code = ?,
        valid_from = ?,
        valid_until = ?
      WHERE id = ? AND user_id = ?`,
      [
        shop_id,
        title,
        description,
        discountPercentage || null,
        discountAmount || null,
        couponCode,
        validFromFormatted,
        validUntilFormatted,
        id,
        userId,
      ]
    );

    res.json({ message: "Offer updated successfully" });

  } catch (err) {
    console.error("Update Offer Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//Get Myoffers
exports.getMyOffers = async (req, res) => {
  try {
    const userId = req.user.id;

    // query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // 🔍 Search condition
    const searchQuery = `
      AND (
        o.title LIKE ? OR 
        o.coupon_code LIKE ? OR 
        s.shop_name LIKE ?
      )
    `;

    const searchValue = `%${search}%`;

    // 🧠 SQL Query
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
        s.shop_name
      FROM offers o
      JOIN shops s ON o.shop_id = s.id
      WHERE s.user_id = ?
      ${search ? searchQuery : ''}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // params
    const params = search
      ? [userId, searchValue, searchValue, searchValue, limit, offset]
      : [userId, limit, offset];

    const [rows] = await pool.query(sql, params);

    res.json(rows);

  } catch (error) {
    console.error('MY OFFERS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getShopDetails = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId || isNaN(shopId)) {
      return res.status(400).json({ message: 'Invalid shop ID' });
    }

    // Get shop (always works)
    const shopSql = `
      SELECT id, user_id, shop_name, description,
             address, city, state, phone, email,
             latitude, longitude, created_at
      FROM shops
      WHERE id = ?
    `;

    const [shopRows] = await pool.query(shopSql, [shopId]);

    if (shopRows.length === 0) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const shop = shopRows[0];

    // Get ratings (optional - won't crash if fails)
    let rating = 0, reviews = 0;
    try {
      const [ratingsRows] = await pool.query(
        `SELECT ROUND(AVG(rating), 1) as average_rating,
                COUNT(id) as total_reviews
         FROM reviews WHERE shop_id = ?`,
        [shopId]
      );

      if (ratingsRows[0]?.average_rating) {
        rating = parseFloat(ratingsRows[0].average_rating);
        reviews = ratingsRows[0].total_reviews;
      }
    } catch (e) {
      console.log('⚠️ Ratings unavailable');
    }

    res.json({
      success: true,
      data: {
        id: shop.id,
        user_id: shop.user_id,
        name: shop.shop_name,
        description: shop.description,
        address: shop.address,
        city: shop.city,
        state: shop.state,
        phone: shop.phone,
        email: shop.email,
        latitude: shop.latitude,
        longitude: shop.longitude,
        rating: rating,
        reviews: reviews,
        created_at: shop.created_at
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shop' });
  }
};


// exports.getOfferDetails = async (req, res) => {
//   try {
//     const { offerId } = req.params;

//     // Validate ID
//     if (!offerId || isNaN(offerId)) {
//       return res.status(400).json({ message: 'Invalid offer ID' });
//     }

//     const sql = `
//       SELECT 
//         o.id,
//         o.user_id,
//         o.shop_id,
//         o.title,
//         o.description,
//         o.discount_percentage,
//         o.discount_amount,
//         o.coupon_code,
//         o.valid_from,
//         o.valid_until,
//         o.created_at,
//         s.shop_name,
//         s.id as shop_id
//       FROM offers o
//       LEFT JOIN shops s ON o.shop_id = s.id
//       WHERE o.id = ?
//     `;

//     const [rows] = await pool.query(sql, [offerId]);

//     // Check if offer exists
//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'Offer not found' });
//     }

//     const offer = rows[0];

//     res.json({
//       success: true,
//       data: offer,
//     });

//   } catch (error) {
//     console.error('GET OFFER DETAILS ERROR:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch offer details'
//     });
//   }
// };

exports.getOfferDetails = async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = req.user?.id || null; // if using auth middleware

    if (!offerId || isNaN(offerId)) {
      return res.status(400).json({ message: 'Invalid offer ID' });
    }

    // 🔥 Insert click tracking
    await pool.query(
      `INSERT INTO offer_clicks (offer_id, user_id) VALUES (?, ?)`,
      [offerId, userId]
    );

    // 🔥 Update total clicks
    await pool.query(
      `UPDATE offers SET total_clicks = total_clicks + 1 WHERE id = ?`,
      [offerId]
    );

    // Get offer details
    const [rows] = await pool.query(
      `SELECT 
        o.id,
        o.user_id,
        o.shop_id,
        o.title,
        o.description,
        o.discount_percentage,
        o.discount_amount,
        o.coupon_code,
        o.valid_from,
        o.valid_until,
        o.created_at,
        o.total_clicks,
        s.shop_name
      FROM offers o
      LEFT JOIN shops s ON o.shop_id = s.id
      WHERE o.id = ?`,
      [offerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching offer' });
  }
};


exports.getOfferAnalytics = async (req, res) => {
  try {
    const { offerId } = req.params;

    // ✅ Validate
    if (!offerId || isNaN(offerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid offer ID'
      });
    }

    // ✅ Get daily clicks
    const [rows] = await pool.query(`
      SELECT 
        DATE(clicked_at) AS date,
        COUNT(*) AS clicks
      FROM offer_clicks
      WHERE offer_id = ?
      GROUP BY DATE(clicked_at)
      ORDER BY date ASC
    `, [offerId]);

    // ✅ Total clicks
    const [total] = await pool.query(`
      SELECT COUNT(*) AS total_clicks
      FROM offer_clicks
      WHERE offer_id = ?
    `, [offerId]);

    // ✅ Today clicks
    const [today] = await pool.query(`
      SELECT COUNT(*) AS today_clicks
      FROM offer_clicks
      WHERE offer_id = ?
      AND DATE(clicked_at) = CURDATE()
    `, [offerId]);

    res.json({
      success: true,
      total_clicks: total[0].total_clicks,
      today_clicks: today[0].today_clicks,
      data: rows
    });

    console.log('ddd', res.json);

  } catch (error) {
    console.error('OFFER ANALYTICS ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};




