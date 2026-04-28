import express from "express"
import turnoRouter from "./turnoRouter.js"

const router = express.Router()

// Configuración de paths bases para cada recurso

router.use('/turno', turnoRouter)

//router.use('/medico', medicoRouter)


export default router