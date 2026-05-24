import { medicoRepository } from '../repository/MedicoRepository.js';
import { DisponibilidadHoraria } from '../domain/DisponibilidadHoraria.js';
import { Especialidad } from '../domain/Especialidad.js';
import { Practica } from '../domain/Practica.js';
import { TurnoService } from '../../turnos/service/TurnoService.js';
import { turnoRepository } from '../../turnos/repository/TurnoRepository.js';
import {
  MedicoNotFoundError,
  DisponibilidadNotFoundError,
  DisponibilidadInvalidaError,
  ServicioNotFoundError,
  ServicioInvalidoError,
} from '../errors/MedicoErrors.js';

function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

const turnoService = new TurnoService(turnoRepository);

function obtenerColeccionServicios(medico, tipo) {
  if (tipo === 'especialidad') {
    return {
      coleccion: medico.especialidades,
      crear: datos => Especialidad.create(datos),
    };
  }

  if (tipo === 'practica') {
    return {
      coleccion: medico.practicas,
      crear: datos => Practica.create(datos),
    };
  }

  throw new ServicioInvalidoError("tipo debe ser 'especialidad' o 'practica'");
}
//SERVICIO: Especialidad o Práctica
export const MedicoService = {
  listarServicios(medicoId) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    return {
      especialidades: medico.especialidades,
      practicas: medico.practicas,
    };
  },

  agregarServicio(medicoId, datos) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const { tipo, ...datosServicio } = datos;
    const { coleccion, crear } = obtenerColeccionServicios(medico, tipo);

    if (coleccion.some(servicio => servicio.id === datosServicio.id)) {
      throw new ServicioInvalidoError(`Ya existe un servicio de tipo '${tipo}' con id '${datosServicio.id}'`);
    }

    const servicio = crear(datosServicio);
    coleccion.push(servicio);
    medicoRepository.save(medico);

    return servicio;
  },

  actualizarServicio(medicoId, tipo, servicioId, cambios) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const { coleccion, crear } = obtenerColeccionServicios(medico, tipo);
    const index = coleccion.findIndex(servicio => servicio.id === servicioId);
    if (index === -1) throw new ServicioNotFoundError(tipo, servicioId);

    const servicioActualizado = crear({
      ...coleccion[index],
      ...cambios,
      id: servicioId,
    });

    coleccion[index] = servicioActualizado;
    medicoRepository.save(medico);

    return servicioActualizado;
  },

  eliminarServicio(medicoId, tipo, servicioId) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const { coleccion } = obtenerColeccionServicios(medico, tipo);
    const index = coleccion.findIndex(servicio => servicio.id === servicioId);
    if (index === -1) throw new ServicioNotFoundError(tipo, servicioId);

    coleccion.splice(index, 1);
    medicoRepository.save(medico);
  },

  listarDisponibilidades(medicoId) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);
    return medico.disponibilidades;
  },

  agregarDisponibilidad(medicoId, datos) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const disponibilidad = DisponibilidadHoraria.create(datos);

    if (horaAMinutos(disponibilidad.horaDesde) >= horaAMinutos(disponibilidad.horaHasta)) {
      throw new DisponibilidadInvalidaError('horaDesde debe ser anterior a horaHasta');
    }

    medico.definirDisponibilidad(disponibilidad);
    medicoRepository.save(medico);
    return disponibilidad;
  },

  actualizarDisponibilidad(medicoId, diaSemana, cambios) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const index = medico.disponibilidades.findIndex(d => d.diaSemana === diaSemana);
    if (index === -1) throw new DisponibilidadNotFoundError(diaSemana);

    const existente = medico.disponibilidades[index];
    const datosMergeados = {
      diaSemana: existente.diaSemana,
      horaDesde: cambios.horaDesde ?? existente.horaDesde,
      horaHasta: cambios.horaHasta ?? existente.horaHasta,
    };

    if (horaAMinutos(datosMergeados.horaDesde) >= horaAMinutos(datosMergeados.horaHasta)) {
      throw new DisponibilidadInvalidaError('horaDesde debe ser anterior a horaHasta');
    }

    const actualizada = DisponibilidadHoraria.create(datosMergeados);
    medico.disponibilidades[index] = actualizada;
    medicoRepository.save(medico);
    return actualizada;
  },

  eliminarDisponibilidad(medicoId, diaSemana) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const index = medico.disponibilidades.findIndex(d => d.diaSemana === diaSemana);
    if (index === -1) throw new DisponibilidadNotFoundError(diaSemana);

    medico.disponibilidades.splice(index, 1);
    medicoRepository.save(medico);
  },

  consultarTurnosDePaciente(medicoId, pacienteId) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    return turnoService.findByMedicoAndPacienteId(medicoId, pacienteId);
  },

  actualizarTurno(medicoId, turnoId, cambios) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    if (cambios.estado === 'CANCELADO') {
      return turnoService.cancelarTurnoMedico(medico, turnoId, cambios.motivo);
    }

    turnoService.obtenerTurnoDelMedico(turnoId, medicoId);

    return turnoService.actualizarTurno(turnoId, cambios);
  },

  consultarDisponibilidadTurno(medicoId, filtros) {
    const medico = medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    return turnoService.consultarDisponibilidad({
      ...filtros,
      medicoId,
    });
  },
};
