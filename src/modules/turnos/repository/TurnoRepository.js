
export class TurnoRepository {
  constructor() {
    this.turnos = [];
  }

  findAll() {
    return this.turnos;
  }

  save(turno) {
    const index = this.turnos.findIndex(t => t.id === turno.id);

    if (index === -1) {
      this.turnos.push(turno);
    } else {
      this.turnos[index] = turno;
    }

    return turno;
  }

  findById(id) {
    return this.turnos.find(turno => turno.id === id);
  }

  findByMedicoId(medicoId) {
    return this.turnos.filter(turno => turno.medico.id === medicoId);
  }

  deleteById(id) { //Porque lo agregué en TurnoService
    const index = this.turnos.findIndex(turno => turno.id === id);

    if (index !== -1) {
      this.turnos.splice(index, 1);
    }
  }

  //--------------------- MOCK ----------------------
  _initMockData() {
    const medico1 = medicoRepository.findById('med-001'); //Armado en base a MedicoRepository
    const medico2 = medicoRepository.findById('med-002');
    const medico3 = medicoRepository.findById('med-003');

    const cardiologia = medico1.especialidades.find(e => e.id === 'esp-001');
    const neurologia = medico2.especialidades.find(e => e.id === 'esp-002');
    const pediatria = medico3.especialidades.find(e => e.id === 'esp-003');

    const paciente1 = {
      id: 'pac-001',
      nombre: 'Juan López',
      dni: '30111222',
    };

    const paciente2 = {
      id: 'pac-002',
      nombre: 'María Fernández',
      dni: '32555666',
    };

    const paciente3 = {
      id: 'pac-003',
      nombre: 'Pedro Ramírez',
      dni: '28999888',
    };

    const sedeCentral = {
      id: 'sede-001',
      nombre: 'Sede Central',
      direccion: 'Av. Siempre Viva 123',
    };

    const sedeNorte = {
      id: 'sede-002',
      nombre: 'Sede Norte',
      direccion: 'Calle Falsa 456',
    };

    const turno1 = Turno.create({
      id: 'tur-001',
      medico: medico1,
      paciente: paciente1,
      fechaHora: this._proximaFechaParaDiaYHora('LUNES', '08:30'),
      sede: sedeCentral,
      especialidad: cardiologia,
      estado: EstadoTurno.DISPONIBLE,
      historialEstados: [],
      costo: cardiologia.costoConsulta,
    });

    const turno2 = Turno.create({
      id: 'tur-002',
      medico: medico2,
      paciente: paciente2,
      fechaHora: this._proximaFechaParaDiaYHora('MARTES', '08:00'),
      sede: sedeNorte,
      especialidad: neurologia,
      estado: EstadoTurno.CONFIRMADO,
      historialEstados: [],
      costo: neurologia.costoConsulta,
    });

    const turno3 = Turno.create({
      id: 'tur-003',
      medico: medico3,
      paciente: paciente3,
      fechaHora: this._proximaFechaParaDiaYHora('VIERNES', '09:00'),
      sede: sedeCentral,
      especialidad: pediatria,
      estado: EstadoTurno.DISPONIBLE,
      historialEstados: [],
      costo: pediatria.costoConsulta,
    });

    return [turno1, turno2, turno3];
  }

  _proximaFechaParaDiaYHora(diaSemana, hora) { //Esto me lo recomendó Gepeto para que el mock genere fechas futuras automáticamente. Total, en la sig entrega vuela
    const dias = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    const fecha = new Date();
    const diaObjetivo = dias[diaSemana];

    const diferenciaDias = (diaObjetivo - fecha.getDay() + 7) % 7 || 7;

    fecha.setDate(fecha.getDate() + diferenciaDias);

    const [horas, minutos] = hora.split(':').map(Number);
    fecha.setHours(horas, minutos, 0, 0);

    return fecha;
  }
}

export const turnoRepository = new TurnoRepository();