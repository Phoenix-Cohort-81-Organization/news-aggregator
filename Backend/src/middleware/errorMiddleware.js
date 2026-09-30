const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode
    || (err.name === 'ValidationError' || err.name === 'CastError' ? 400 : undefined)
    || (err.code === 11000 ? 409 : 500);
  const message = statusCode >= 500
    ? 'Internal Server Error'
    : err.code === 11000
      ? 'A record with one of these values already exists'
      : err.message || 'Request failed';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
module.exports = errorMiddleware;