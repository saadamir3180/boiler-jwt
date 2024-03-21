const express = require('express');
const controllers = require('../controllers');
const router = express.Router();

function tmp(req, res) {}


router.post('/login', controllers.auth.login);
router.post('/signup', controllers.auth.signUp);
router.post('/logout', tmp);
router.post('/accessToken', tmp);
// router.post('/refreshToken', controllers.auth.newRefreshToken);


module.exports = router;