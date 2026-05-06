const pool = require('../db');
const multer = require('multer');
const path = require('path');

// ✅ Multer Setup for File Upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage: storage });

exports.upload = upload.single('file'); // Export to use as middleware

// ✅ Create new product
exports.createProduct = async (req, res) => {
  const { name, text, description } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!name || !text || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, text, description, file) VALUES (?, ?, ?, ?)',
      [name, text, description, file]
    );
    res.json({ id: result.insertId, name, text, description, file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all products
exports.getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get product by ID
exports.getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update product by ID
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, text, description } = req.body;
  const file = req.file ? req.file.filename : null;

  try {
    const [result] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedFile = file ? file : result[0].file;

    await pool.query(
      'UPDATE products SET name = ?, text = ?, description = ?, file = ? WHERE id = ?',
      [name, text, description, updatedFile, id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete product by ID
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
