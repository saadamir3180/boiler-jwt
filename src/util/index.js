const mongoose = require('mongoose');

function errorHandler(aFunction) {
  return async function (req, res, next) {
    try {
      const result = await aFunction(req, res);
      res.json(result);
    }
    catch (error) {
      next(error);
    }
  }

}


function withTransaction(aFunction) {
  return async function (req, res, next) {
    let result;
    await mongoose.connection.transaction(async(session) => {
      result = await aFunction(req, res, session);
      return result;
    })

    return result;
  }
}

module.exports = {  
  errorHandler,
  withTransaction
};