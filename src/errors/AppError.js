export class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.status = statusCode >= 500 ? "error" : "fail"
        this.timestamp = new Date().toISOString()
        this.details = details
    }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404)
  }
}

