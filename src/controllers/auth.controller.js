const jwt = require('jsonwebtoken');
const model = require('../models')
const argon2 = require('argon2');
const {errorHandler, withTransaction} = require('../util');
const {HttpError} = require('../error');


const signUp = errorHandler(withTransaction(
  async (req, res, session) => {
    //passed a session for successful transection i.e either rollback or commit 
    // by default commit 

    const { username, password, role } = req.body;

    const existingUser = await model.User.findOne({ username: req.body.username }).exec();
    if (existingUser) {
      throw new HttpError(400, 'Username is already taken');
    }
    // Validate role if provided
    if (role && !['user', 'manager'].includes(role)) {
      throw new HttpError(400, 'Invalid role');
    }
    // Create a user document
    const userDoc = model.User({
      username: username,
      password: await argon2.hash(password),
      role: role || 'user', // Set default role to 'user' if not provided
    });
    // Create a refresh token document
    const refreshTokenDoc = model.RefreshToken({
      user: userDoc.id
    });


  
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

const newRefreshToken = errorHandler(withTransaction(async (req, res, session) => {
  const currentRefreshToken = await validateRefreshToken(req.body.refreshToken);
  const refreshTokenDoc = await model.RefreshToken({
    owner: currentRefreshToken.userId,
  });

  // Delete the previous refresh token
  const deleteResult = await model.RefreshToken.deleteOne({ _id: currentRefreshToken.tokenId }, { session });
  if (deleteResult.deletedCount !== 1) {
    throw new HttpError("Failed to delete previous refresh token");
  }

  // Create a new refresh token
  await refreshTokenDoc.save({ session });

  // Generate new access and refresh tokens
  const accessToken = createAccessToken(currentRefreshToken.userId);
  const refreshToken = createRefreshToken(currentRefreshToken.userId, refreshTokenDoc.id);

  return {
    id: currentRefreshToken.userId,
    accessToken,
    refreshToken
  };
}));

const newAccessToken = errorHandler(
  async (req, res) => {
    const refreshToken = await validateRefreshToken(req.body.refreshToken);

    // Generate a new access token
    const accessToken = createAccessToken(refreshToken.userId);

    return {
      id: refreshToken.userId,
      accessToken,
      refreshToken: req.body.refreshToken
    };
  }
)

const logout = errorHandler(withTransaction(async (req, res, session) => {
  const refreshToken = await validateRefreshToken(req.body.refreshToken);
  await model.RefreshToken.deleteOne({_id: refreshToken.tokenId}, {session});
  return {success: true};
}));

const logoutAll = errorHandler(withTransaction(async (req, res, session) => {
  const refreshToken = await validateRefreshToken(req.body.refreshToken);
  await model.RefreshToken.deleteMany({owner: refreshToken.user}, {session});


  return {success: true};
}
))


function createAccessToken (userId) {
  return jwt.sign({
    userId: userId,
  }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d'  
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
  const decodeToken = () =>{
    try {
      return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
      throw new HttpError(401, 'Unauthorized')
    }
  }

  const decodedToken = decodeToken()
  const tokenExists = model.RefreshToken.exists({id: decodedToken.tokenId})
  if(tokenExists){
    return decodedToken;
  }
  else{
    throw new HttpError(401, 'Unauthorized')
  }

}

module.exports = {
    signUp,
    login, 
    newRefreshToken,
    newAccessToken,
    logout,
    logoutAll
};