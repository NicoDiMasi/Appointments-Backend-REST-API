import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import { MongoDBClient } from "./config/database.js"
import { turnoRepository } from "./modules/turnos/repository/TurnoRepository.js"
import { notificacionService } from "./modules/notificaciones/service/NotificacionService.js"
import { TipoNotificacion } from "./modules/notificaciones/domain/TipoNotificacion.js"
import { mismaFechaArgentina } from "./utils/dateTime.js"

const PORT = process.env.PORT || 3000

function programarRecordatoriosDiarios() {
  const UN_DIA_EN_MS = 24 * 60 * 60 * 1000;

  const enviarRecordatorios = async () => {
    try {
      const manana = new Date(Date.now() + UN_DIA_EN_MS);
      const turnos = turnoRepository.findAll().filter(t => mismaFechaArgentina(t.fechaHora, manana));

      for (const turno of turnos) {
        if (turno.paciente?.id) {
          notificacionService.crearNotificacion({
            destinatarioId: turno.paciente.id,
            destinatarioTipo: 'paciente',
            remitenteId: 'sistema',
            remitenteTipo: 'sistema',
            mensaje: `Recordatorio: tenes un turno manana con el Dr./Dra. ${turno.medico?.nombre ?? 'tu medico'}.`,
            tipo: TipoNotificacion.RECORDATORIO,
          }).catch(err => console.error('Error notificacion recordatorio paciente:', err));
        }

        if (turno.medico?.id) {
          notificacionService.crearNotificacion({
            destinatarioId: turno.medico.id,
            destinatarioTipo: 'medico',
            remitenteId: 'sistema',
            remitenteTipo: 'sistema',
            mensaje: `Recordatorio: tenes un turno manana con el paciente ${turno.paciente?.nombre ?? 'un paciente'}.`,
            tipo: TipoNotificacion.RECORDATORIO,
          }).catch(err => console.error('Error notificacion recordatorio medico:', err));
        }
      }
    } catch (err) {
      console.error('Error al enviar recordatorios diarios:', err);
    }
  };

  setInterval(enviarRecordatorios, UN_DIA_EN_MS);
}

const start = async () => {
    try {
        await MongoDBClient.connect()
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
        programarRecordatoriosDiarios()
    } catch (error) {
        console.error(error)
    }
}

start()
