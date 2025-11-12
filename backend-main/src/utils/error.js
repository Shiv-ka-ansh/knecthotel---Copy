export function createError(statusCode = 500, message = 'Server Error', meta) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (meta) err.meta = meta; // e.g. Zod issues
  return err;
}