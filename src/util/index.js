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

module.exports = {
  errorHandler
};