import { medicoRepository } from '../repository/MedicoRepository.js';
import { DisponibilidadHoraria } from '../domain/DisponibilidadHoraria.js';
import {
  MedicoNotFoundError,
  DisponibilidadNotFoundError,
  DisponibilidadInvalidaError,
} from '../errors/MedicoErrors.js';

function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export const MedicoService = {
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
};
