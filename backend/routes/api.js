
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const contentController = require('../controllers/contentController');

router.get('/users', userController.getAllUsers);
router.post('/content', contentController.createContent);

module.exports = router;
