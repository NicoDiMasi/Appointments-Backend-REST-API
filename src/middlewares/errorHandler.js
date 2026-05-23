import { AppError } from "../errors/AppError.js"

export function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }

    if (err instanceof AppError) {
        const response = {
            status: err.status,
            message: err.message,
            timestamp: err.timestamp,
        }

        if (err.details) {
            response.details = err.details
        }

        return res.status(err.statusCode).json(response)
    }

    return res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
        timestamp: new Date().toISOString(),
    })
}
