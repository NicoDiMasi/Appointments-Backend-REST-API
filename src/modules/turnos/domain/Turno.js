import { EstadoTurno } from './EstadoTurno.js';
import { CambioEstadoTurno } from './CambioEstadoTurno.js';

const ESTADOS_VALIDOS = Object.values(EstadoTurno);

export class Turno {
    constructor({ id, medico, paciente, fechaHora, sede, practica, estado, historialEstados, costo }) {
        this.id = id;
        this.medico = medico;
        this.paciente = paciente;
        this.fechaHora = fechaHora;
        this.sede = sede;
        this.practica = practica;
        this.estado = estado;
        this.historialEstados = historialEstados ?? [];
        this.costo = costo;
        this.duracionTurno = practica.duracionTurnoEnMins;
    }

    
    actualizarEstado(nuevoEstado, quien, motivo) {
        if (!nuevoEstado || !ESTADOS_VALIDOS.includes(nuevoEstado)) {
            throw new Error(`nuevoEstado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
        }

        if (!quien) {
            throw new Error('El usuario que actualiza el estado es obligatorio');
        }

        const cambioEstado = CambioEstadoTurno.create({
            fechaHoraIngreso: new Date(),
            estado: nuevoEstado,
            turno: this,
            usuario: quien,
            motivo,
        });

        this.estado = nuevoEstado;
        this.historialEstados.push(cambioEstado);
    }


    static create({ id, medico, paciente, fechaHora, sede, practica, estado, historialEstados, costo }) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('El id del turno es obligatorio');
        }
        if (!medico) {
            throw new Error('El médico del turno es obligatorio');
        }
        if (estado !== EstadoTurno.DISPONIBLE && !paciente) { //Actualizo lògica porque sino no puedo crear un turno sin paciente
            throw new Error('El paciente del turno es obligatorio');
        }
        if (!(fechaHora instanceof Date) || Number.isNaN(fechaHora.getTime())) {
            throw new Error('fechaHora debe ser una fecha válida');
        }
        if (estado !== EstadoTurno.DISPONIBLE && !sede) {
            throw new Error('La sede del turno es obligatoria');
        }
        if (!practica) {
            throw new Error('La práctica del turno es obligatoria');
        }
        if (!estado || !ESTADOS_VALIDOS.includes(estado)) { //Acà ver. consideramos que se puede agregar con otro tipo de estado?
            throw new Error(`estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
        }
        if (typeof costo !== 'number' || costo < 0) {
            throw new Error('costo debe ser un número mayor o igual a cero');
        }
        return new Turno({
            id,
            medico,
            paciente,
            fechaHora,
            sede,
            practica,
            estado,
            historialEstados: historialEstados ?? [],
            costo,
        });
    }

    diaTurno() {
      return this.fechaHora.getDay();
    }

    inicioTurno() {
      return this.fechaHora.getHours() * 60 + this.fechaHora.getMinutes();
    }

    finTurno() {
      return this.getInicioEnMinutos() + this.duracionTurno;
    }
}