import { formatearFechaHoraArgentina } from '../utils/dateTime.js'

export class AppError extends Error {
    constructor(message, statusCode, details = null) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.status = statusCode >= 500 ? "error" : "fail"
        this.timestamp = formatearFechaHoraArgentina(new Date())
        this.details = details
    }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404)
  }
}

