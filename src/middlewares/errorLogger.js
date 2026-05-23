import { formatearFechaHoraArgentina } from "../utils/dateTime.js"

export function errorLogger(err, req, res, next) {
    console.error({
        timestamp: formatearFechaHoraArgentina(new Date()),
        method: req.method,
        path: req.originalUrl,
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
    })

    next(err)
}
