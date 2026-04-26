import { medicoRepository } from '../repository/MedicoRepository.js';
import { DisponibilidadHoraria } from '../domain/DisponibilidadHoraria.js';
import {
  MedicoNotFoundError,
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
};
