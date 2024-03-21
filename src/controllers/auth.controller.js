const jwt = require('jsonwebtoken');
const model = require('../models')
const argon2 = require('argon2');
const {errorHandler, withTransaction} = require('../util');
const {HttpError} = require('../error');


const signUp = errorHandler(withTransaction(
  async (req, res, session) => {
    //passed a session for successful transection i.e either rollback or commit 
    // by default commit 

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
  
    // Create access token and refresh token for client
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

const login = errorHandler(withTransaction(
  async (req, res, session) => {
    // Find the user in the database
    const userDoc = await model.User
    .findOne({username: req.body.username})
    .select('+password')
    .exec();
  
    // throw new HttpError if the user exists and the password is correct
    if (!userDoc) {
      throw new HttpError(400, 'Invalid username or password');
    }
    await verifyPassword(userDoc.password, req.body.password);
      

    const refreshTokenDoc = model.RefreshToken({
      user: userDoc.id
    })

    await refreshTokenDoc.save({session})
    
    // Create access token and refresh token for client
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


  }
))

const newRefreshToken = errorHandler(withTransaction( async (req, res, session) => {

  const currentRefreshToken = validateRefreshToken(req.body.refreshToken)
  const refreshTokenDoc = await model.RefreshToken({
    owner: currentRefreshToken.userId,
  })

  await refreshTokenDoc.save({session})

  
    const accessToken = createAccessToken(currentRefreshToken.userId)
    const refreshToken = createRefreshToken(currentRefreshToken.userId, refreshTokenDoc.id)
    

    
    return {
        id: currentRefreshToken.userId,
        accessToken,
        refreshToken
      }



}))

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
  }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'  
  })  
}

const verifyPassword = async (hash, raw) => {
  if (await argon2.verify(hash, raw)) {
    //matches
  }
  else{    
    throw new HttpError(400, 'Invalid username or password');
  }
}

const validateRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
  } catch (error) {
    throw new HttpError(401, 'Unauthorized')
  }

}

module.exports = {
    signUp,
    login, 
    newRefreshToken
};