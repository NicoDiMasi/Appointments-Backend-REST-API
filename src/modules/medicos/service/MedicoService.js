import { medicoRepository } from '../repository/MedicoRepository.js';
import { Medico } from '../domain/Medico.js';
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

  async findAll() {
    return medicoRepository.findAll();
  },

  async findById(medicoId) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);
    return medico;
  },

  async crearMedico(datos) {
    const medico = Medico.create(datos);
    return await medicoRepository.save(medico);
  },

  async listarServicios(medicoId) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    return {
      especialidades: medico.especialidades,
      practicas: medico.practicas,
    };
  },

  async agregarServicio(medicoId, datos) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const { tipo, ...datosServicio } = datos;
    const { coleccion, crear } = obtenerColeccionServicios(medico, tipo);

    if (coleccion.some(servicio => servicio.id === datosServicio.id)) {
      throw new ServicioInvalidoError(`Ya existe un servicio de tipo '${tipo}' con id '${datosServicio.id}'`);
    }

    const servicio = crear(datosServicio);
    coleccion.push(servicio);
    await medicoRepository.updateById(medico.id, { especialidades: medico.especialidades, practicas: medico.practicas });

    return servicio;
  },

  async actualizarServicio(medicoId, tipo, servicioId, cambios) {
    const medico = await medicoRepository.findById(medicoId);
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
    await medicoRepository.updateById(medico.id, { especialidades: medico.especialidades, practicas: medico.practicas });

    return servicioActualizado;
  },

  async eliminarServicio(medicoId, tipo, servicioId) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const { coleccion } = obtenerColeccionServicios(medico, tipo);
    const index = coleccion.findIndex(servicio => servicio.id === servicioId);
    if (index === -1) throw new ServicioNotFoundError(tipo, servicioId);

    coleccion.splice(index, 1);
    await medicoRepository.updateById(medico.id, { especialidades: medico.especialidades, practicas: medico.practicas });
  },

  async listarDisponibilidades(medicoId) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);
    return medico.disponibilidades;
  },

  async agregarDisponibilidad(medicoId, datos) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const disponibilidad = DisponibilidadHoraria.create(datos);

    if (horaAMinutos(disponibilidad.horaDesde) >= horaAMinutos(disponibilidad.horaHasta)) {
      throw new DisponibilidadInvalidaError('horaDesde debe ser anterior a horaHasta');
    }

    medico.definirDisponibilidad(disponibilidad);
    await medicoRepository.updateById(medico.id, { disponibilidades: medico.disponibilidades });
    return disponibilidad;
  },

  async actualizarDisponibilidad(medicoId, diaSemana, cambios) {
    const medico = await medicoRepository.findById(medicoId);
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
    await medicoRepository.updateById(medico.id, { disponibilidades: medico.disponibilidades });
    return actualizada;
  },

  async eliminarDisponibilidad(medicoId, diaSemana) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    const index = medico.disponibilidades.findIndex(d => d.diaSemana === diaSemana);
    if (index === -1) throw new DisponibilidadNotFoundError(diaSemana);

    medico.disponibilidades.splice(index, 1);
    await medicoRepository.updateById(medico.id, { disponibilidades: medico.disponibilidades });
  },

  async consultarTurnosDePaciente(medicoId, pacienteId) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    return turnoService.findByMedicoAndPacienteId(medicoId, pacienteId);
  },

  async actualizarTurno(medicoId, turnoId, cambios) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    if (cambios.estado === 'CANCELADO') {
      return turnoService.cancelarTurnoMedico(medico, turnoId, cambios.motivo);
    }

    turnoService.obtenerTurnoDelMedico(turnoId, medicoId);

    return turnoService.actualizarTurno(turnoId, cambios);
  },

  async consultarDisponibilidadTurno(medicoId, filtros) {
    const medico = await medicoRepository.findById(medicoId);
    if (!medico) throw new MedicoNotFoundError(medicoId);

    return turnoService.consultarDisponibilidad({
      ...filtros,
      medicoId,
    });
  },
};
