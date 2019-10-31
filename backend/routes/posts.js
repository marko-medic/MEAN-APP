const express = require('express');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const PostModel = require('../models/post');

const router = express.Router();

const MIME_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPES[file.mimetype];
    const error = isValid ? null : new Error('Invalid mime-type');
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLocaleLowerCase()
      .split(' ')
      .join('-');
    const ext = MIME_TYPES[file.mimetype];
    const fullName = `${name}-${Date.now()}.${ext}`;
    cb(null, fullName);
  }
});

// image je prop poslat iz angulara
router.post(
  '',
  checkAuth,
  multer({ storage }).single('image'),
  (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}`;
    const post = new PostModel({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${req.file.filename}`, // multer obezbedjuje file.filename,
      authorId: req.userData.id
    });
    post.save().then(savedPost => {
      res.status(201).json({
        message: 'Post added',
        post: savedPost
      });
    });
  }
);

router.delete('/:id', checkAuth, (req, res, next) => {
  const id = req.params.id;
  PostModel.deleteOne({
    _id: id,
    authorId: req.userData.id
  }).then(result => {
    if (result.n > 0) {
      res.status(200).json({
        message: 'Post deleted'
      });
    } else {
      res.status(401).json({
        message: 'Not authorized'
      });
    }
  });
});

router.put(
  '/:id',
  checkAuth,
  multer({ storage }).single('image'),
  (req, res, next) => {
    const id = req.params.id;
    let imagePath = req.body.imagePath;

    if (req.file) {
      const url = `${req.protocol}://${req.get('host')}`;
      imagePath = `${url}/images/${req.file.filename}`;
    }
    const post = new PostModel({
      _id: id, // mora _id jer je _id immutable
      title: req.body.title,
      content: req.body.content,
      imagePath,
      authorId: req.userData.id
    });

    PostModel.updateOne({ _id: id, authorId: req.userData.id }, post)
      .then(result => {
        if (result.nModified > 0) {
          res.status(200).json({
            message: 'Post updated',
            post
          });
        } else {
          res.status(401).json({
            message: 'Not authorized'
          });
        }
      })
      .catch(() => {
        res.status(500).json({
          message: 'Post updating failed'
        });
      });
  }
);

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  PostModel.findById(id)
    .then(post => {
      if (post) {
        res.status(200).json({
          message: 'Post found',
          post
        });
      } else {
        res.status(404).json({
          message: 'Post not found'
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'Getting post failed'
      });
    });
});

// moze i use umesto get
router.get('', (req, res, next) => {
  const pageSize = Number(req.query.pagesize);
  const currentPage = Number(req.query.page);
  const postQuery = PostModel.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(docs => {
      fetchedPosts = docs;
      return PostModel.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched',
        data: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(() => {
      res.status(500).json({
        message: 'Fetching posts failed'
      });
    });
});

module.exports = router;
