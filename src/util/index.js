const mongoose = require('mongoose');

function errorHandler(aFunction) {
  return async function (req, res, next) {
    try {
      let nextCalled = false;
      const result = await aFunction(req, res, (params)=> { nextCalled = true; next(params);});
      if (!nextCalled && !res.headersSent){
        res.json(result);
      }
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
      //session object is returned by mongoose.connection.transaction
      return result;
    }) 

    return result;
  }
}

module.exports = {  
  errorHandler,
  withTransaction
};