
//Production//

const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;


//Local host//

// const mysql = require('mysql2/promise');
// require('dotenv').config();
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME
// });

// module.exports = pool;