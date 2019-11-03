const express = require('express');
const checkAuth = require('../middleware/check-auth');
const PostsController = require('../controllers/posts');
const extractFile = require('../middleware/extract-file');

const router = express.Router();

// image je prop poslat iz angulara
router.post('', checkAuth, extractFile, PostsController.createPost);

router.delete('/:id', checkAuth, PostsController.deletePost);

router.put('/:id', checkAuth, extractFile, PostsController.updatePost);

router.get('/:id', PostsController.getPost);

// moze i use umesto get
router.get('', PostsController.getPosts);

module.exports = router;
