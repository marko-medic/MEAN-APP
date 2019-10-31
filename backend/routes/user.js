const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new UserModel({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then(result =>
        res.status(201).json({
          message: 'User created',
          result
        })
      )
      .catch(err => res.status(500).json({ message: 'User already exists' }));
  });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  UserModel.findOne({
    email: req.body.email
  })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      const token = jwt.sign(
        {
          email: fetchedUser.email,
          id: fetchedUser._id
        },
        'some_secret_key',
        {
          expiresIn: '1h'
        }
      );
      res.status(200).json({
        token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch(err => {
      res.status(401).json({
        message: 'Invalid credentials',
        error: err
      });
    });
});

module.exports = router;
