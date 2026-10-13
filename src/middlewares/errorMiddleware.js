module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  if (err.name === "ValidationError" || err.name === "CastError") {
    statusCode = 400;
  }
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
  }
  if (err.code === 11000) {
    statusCode = 409;
  }
  if (statusCode === 500) {
    console.error(err);
  }
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : err.message,
  });
};
