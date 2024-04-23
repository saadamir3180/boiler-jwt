const express = require('express');
const controllers = require('../controllers');
const middlewares = require('../middleware');
const router = express.Router();


router.get('/me', middlewares.verifyAccessToken , controllers.auth.me);


module.exports = router;