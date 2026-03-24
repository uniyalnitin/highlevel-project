class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

module.exports = { AppError, NotFoundError, ValidationError, ConflictError, UnauthorizedError };
