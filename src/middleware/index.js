const { HttpError } = require('../error');
const { errorHandler } = require('../util');
const jwt = require('jsonwebtoken');


const verifyAccessToken = errorHandler((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if(!token){
        throw HttpError(401, 'Unauthorized');
    }

    try{
        const deceodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = deceodedToken.userId;
        next();
    }catch(err){
        throw HttpError(401, 'Unauthorized');
    }
})

module.exports = {
    verifyAccessToken
};