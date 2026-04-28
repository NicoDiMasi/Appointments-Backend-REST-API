import { Turno } from '../domain/Turno.js';
import { Agenda } from '../domain/Agenda.js';
import { TurnoRepository } from '../repository/TurnoRepository.js';

export class TurnoService {

  constructor(turnoRepository) {
    this.turnoRepository = turnoRepository;
  }

  crearTurno(datosTurno) {
    const turnoNuevo = Turno.create(datosTurno);

    const turnosDelMedico = this.turnoRepository.findByMedicoId(
      turnoNuevo.medico.id
    );

    const estaDisponible = this.agenda.estaDisponible(
      turnoNuevo,
      turnosDelMedico
    );

    if (!estaDisponible) {
      throw new Error("El médico no está disponible en ese horario");
    }

    return this.turnoRepository.save(turnoNuevo);
  }
}