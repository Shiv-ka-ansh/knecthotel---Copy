class SocketError extends Error {
  constructor(message, statusCode = 400, meta = {}) {
    super(message);
    this.statusCode = statusCode;
    this.meta = meta;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function handleSocketError(socket, err) {
  const error =
    err instanceof SocketError
      ? err
      : new SocketError(err.message || "Internal Socket Error", 500);
 
  /* eslint-disable no-console */
  console.error("[SOCKET]", error);
  /* eslint-enable no-console */

  socket.emit("socket:error", {
    message: error.message,
    statusCode: error.statusCode,
    meta: error.meta,
  });
}

module.exports = { SocketError, handleSocketError };
