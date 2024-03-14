function errorHandler(aFunction) {
  try {
    aFunction();
  } catch (error) {
    console.error(error);
  }
}