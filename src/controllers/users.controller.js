const { model } = require('mongoose');
const { errorHandler } = require('../util');
const me = errorHandler( async (req, res) => {
    const userDoc = await model.User.findById(req.userId).exec();
    if(!userDoc){
        throw newHttpError(400, 'User not found');
    }
        return userDoc;
});


module.exports = {
    me
};