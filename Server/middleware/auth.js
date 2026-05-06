// const jwt = require('jsonwebtoken');

// module.exports = function verifyToken(req, res, next) {
//   const token = req.headers['authorization']; // directly use the token

//   if (!token) {
//     return res.status(401).json({ error: 'No token' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: 'Invalid token' });
//     }
//     req.user = user;
//     next();
//   });
// };

const jwt = require('jsonwebtoken');

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  // 🔥 FIX HERE
  const token = authHeader.startsWith('Bearer ')
  ? authHeader.split(' ')[1]
  : authHeader; // remove "Bearer"

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};