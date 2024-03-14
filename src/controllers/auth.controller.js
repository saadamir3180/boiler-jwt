const jwt = require('jsonwebtoken');
const model = require('../models')
const argon2 = require('argon2');
const {errorHandler, withTransaction} = require('../util');
const {HttpError} = require('../error');


const signUp = errorHandler(withTransaction(
  async (req, res, session) => {

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
    await userDoc.save({session})
    await refreshTokenDoc.save({session})
  
    // Create access token and refresh token
    const accessToken = createAccessToken(userDoc.id)
    const refreshToken = createRefreshToken(userDoc.id, refreshTokenDoc.id)
  

    // throw new HttpError(400, 'Invalid username or password');
   //for testing only
   //confirms incase of any error thrown, the transaction will be rolled back

    // Send the access token and refresh token to the client
    return {
        id: userDoc.id,
        accessToken,
        refreshToken
      }
    // res.json({
    //   id: userDoc.id,
    //   accessToken,
    //   refreshToken
    // })
  
  }
))



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