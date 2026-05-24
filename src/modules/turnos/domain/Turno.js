import { EstadoTurno } from './EstadoTurno.js';
import { CambioEstadoTurno } from './CambioEstadoTurno.js';
import {
    calcularCantidadModulos,
    calcularDuracionModular,
} from './ModuloTurno.js';
import {
    formatearFechaHoraArgentina,
    obtenerDiaSemanaArgentina,
    obtenerMinutosDelDiaArgentina,
} from '../../../utils/dateTime.js';

const ESTADOS_VALIDOS = Object.values(EstadoTurno);

function copiarMedico(medico) { //Esto evita que se modifique el turno ya creado si el médico modifica su horario
    return {
        ...medico,
        especialidades: [...(medico.especialidades ?? [])],
        practicas: [...(medico.practicas ?? [])],
        disponibilidades: (medico.disponibilidades ?? []).map(disponibilidad => ({
            ...disponibilidad,
        })),
    };
}

export class Turno {
    constructor({ id, medico, paciente, fechaHora, sede, especialidad = null, practica = null, estado, historialEstados, costo, duracionTurno, modulosRequeridos}) {
        this.id = id;
        this.medico = copiarMedico(medico);
        this.paciente = paciente;
        this.fechaHora = fechaHora;
        this.sede = sede;
        this.especialidad = especialidad;
        this.practica = practica;
        this.estado = estado;
        this.historialEstados = historialEstados ?? [];
        this.costo = costo;
        this.duracionTurno = duracionTurno;
        this.modulosRequeridos = modulosRequeridos;
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


    static create({ id, medico, paciente, fechaHora, sede, especialidad = null, practica = null, estado, historialEstados, costo, duracionTurno, modulosRequeridos }) {
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
        if (!especialidad && !practica) { 
          throw new Error('El turno debe tener especialidad o práctica');
        }
        if (!estado || !ESTADOS_VALIDOS.includes(estado)) { //Acà ver. consideramos que se puede agregar con otro tipo de estado?
            throw new Error(`estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
        }
        if (typeof costo !== 'number' || costo < 0) {
            throw new Error('costo debe ser un número mayor o igual a cero');
        }
        const duracionPrestacion =
          practica?.duracionTurnoEnMins ??
          practica?.duracionEnMins ??
          especialidad?.duracionTurnoEnMins;

        const modulosRequeridosCalculo = modulosRequeridos ?? calcularCantidadModulos(duracionPrestacion);
        const duracionTurnoCalculo = duracionTurno ?? calcularDuracionModular(duracionPrestacion);

        return new Turno({
            id,
            medico,
            paciente,
            fechaHora,
            sede,
            especialidad,
            practica,
            estado,
            historialEstados: historialEstados ?? [],
            costo,
            duracionTurno: duracionTurnoCalculo,
            modulosRequeridos: modulosRequeridosCalculo
        });
    }

    diaTurno() {
      return obtenerDiaSemanaArgentina(this.fechaHora);
    }

    inicioTurno() {
      return obtenerMinutosDelDiaArgentina(this.fechaHora);
    }

    finTurno() {
      return this.inicioTurno() + this.duracionTurno;
    }

    toJSON() {
      return {
        id: this.id,
        medico: this.medico,
        paciente: this.paciente,
        fechaHora: formatearFechaHoraArgentina(this.fechaHora),
        sede: this.sede,
        especialidad: this.especialidad,
        practica: this.practica,
        estado: this.estado,
        historialEstados: this.historialEstados,
        costo: this.costo,
        duracionTurno: this.duracionTurno,
        modulosRequeridos: this.modulosRequeridos,
      };
    }

    
}
