const jwt = require('jsonwebtoken');
const model = require('../models')
const argon2 = require('argon2');

async function signUp (req, res) {

  // Create a user document
  const userDoc = model.User({
    username: req.body.username,
    password: await argon2.hash(req.body.password)
  })
  // Create a refresh token document
  const refreshTokenDoc = model.RefreshToken({
    user: userDoc.id
  })

  // Save the user and refresh token to the database
  await userDoc.save()
  await refreshTokenDoc.save()

  // Create access token and refresh token
  const accessToken = createAccessToken(userDoc.id)
  const refreshToken = createRefreshToken(userDoc.id, refreshTokenDoc.id)

  // Send the access token and refresh token to the client
  res.json({
    id: userDoc.id,
    accessToken,
    refreshToken
  })

}

function createAccessToken (userId) {
  return jwt.sign({
    userId: userId,
  }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '10m'  
  })  
}

function createRefreshToken(userId, refreshTokenId){
  return jwt.sign({
    userId: userId,
    tokenId: refreshTokenId
  }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '30d'  
  })  
}

module.exports = {
    signUp
};