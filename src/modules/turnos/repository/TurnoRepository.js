
export class TurnoRepository {
  constructor() {
    this.turnos = [];
  }

  findAll() {
    return this.turnos;
  }

  save(turno) {
    this.turnos.push(turno);
    return turno;
  }

  findByMedicoId(medicoId) {
    return this.turnos.filter(turno => turno.medico.id === medicoId);
  }
}