const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  try {
    // pravilo - Bearer 2131asdasda u hederu
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'some_secret_key'); // baca izuzetak ako ne postoji (kao i linija iznad)
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized',
      error
    });
  }
};

module.exports = checkAuth;
