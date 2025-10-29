export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.isJoi) {
    return res.status(400).json({ error: 'ValidationError', details: err.details });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
}
