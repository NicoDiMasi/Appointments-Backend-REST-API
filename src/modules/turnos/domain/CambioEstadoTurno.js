import { EstadoTurno } from './EstadoTurno.js';
import { formatearFechaHoraArgentina } from '../../../utils/dateTime.js';

const ESTADOS_VALIDOS = Object.values(EstadoTurno);

export class CambioEstadoTurno {
  constructor({ fechaHoraIngreso, estado, turno, usuario, motivo }) {
    this.fechaHoraIngreso = fechaHoraIngreso;
    this.estado = estado;
    this.turno = turno;
    this.usuario = usuario;
    this.motivo = motivo;
  }

  static create({ fechaHoraIngreso, estado, turno, usuario, motivo }) {
    if (!(fechaHoraIngreso instanceof Date) || Number.isNaN(fechaHoraIngreso.getTime())) {
      throw new Error('fechaHoraIngreso debe ser una fecha válida');
    }

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      throw new Error(`estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    if (!turno) {
      throw new Error('El turno es obligatorio');
    }

    if (!usuario) {
      throw new Error('El usuario es obligatorio');
    }

    if (motivo !== undefined && typeof motivo !== 'string') {
      throw new Error('motivo debe ser un texto');
    }

    return new CambioEstadoTurno({
      fechaHoraIngreso,
      estado,
      turno,
      usuario,
      motivo: motivo ?? '',
    });
  }

  toJSON() {
    return {
      fechaHoraIngreso: formatearFechaHoraArgentina(this.fechaHoraIngreso),
      estado: this.estado,
      turno: {
        id: this.turno.id,
      },
      usuario: this.usuario,
      motivo: this.motivo,
    };
  }
}
