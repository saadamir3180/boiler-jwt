const express = require('express');
const controllers = require('../controllers');
const router = express.Router();

function tmp(req, res) {}


router.post('/login', controllers.auth.login);
router.post('/signup', controllers.auth.signUp);
router.post('/logout', controllers.auth.logout);
router.post('/logoutAll', controllers.auth.logoutAll);
router.post('/accessToken', controllers.auth.newAccessToken);
router.post('/refreshToken', controllers.auth.newRefreshToken);


module.exports = router;