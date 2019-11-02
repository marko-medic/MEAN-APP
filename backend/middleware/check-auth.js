const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  try {
    // pravilo - Bearer 2131asdasda u hederu
    const token = req.headers.authorization.split(' ')[1];

    const decodedToken = jwt.verify(token, process.env.JWT_KEY); // baca izuzetak ako ne postoji (kao i linija iznad)
    // takodje vraca i {email, id}
    req.userData = decodedToken; // zakaci userData za req
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized',
      error
    });
  }
};

module.exports = checkAuth;
