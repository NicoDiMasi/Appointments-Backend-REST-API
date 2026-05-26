import { Paciente } from '../domain/Paciente.js';

class PacienteRepository {
  constructor() {
    if (PacienteRepository._instance) {
      return PacienteRepository._instance;
    }

    PacienteRepository._instance = this;
    this.pacientes = this._initMockData();
  }

  _initMockData() {
    return [
      Paciente.create({
        id: 'pac-001',
        usuario: { id: 'usr-001', email: 'juan.lopez@example.com' },
        dni: '30111222',
        nombre: 'Juan Lopez',
        obraSocial: 'OSDE',
        plan: '210',
      }),
      Paciente.create({
        id: 'pac-002',
        usuario: { id: 'usr-002', email: 'maria.fernandez@example.com' },
        dni: '32555666',
        nombre: 'Maria Fernandez',
        obraSocial: 'Swiss Medical',
        plan: 'SMG20',
      }),
      Paciente.create({
        id: 'pac-003',
        usuario: { id: 'usr-003', email: 'pedro.ramirez@example.com' },
        dni: '28999888',
        nombre: 'Pedro Ramirez',
        obraSocial: null,
        plan: null,
      }),
    ];
  }

  findAll() {
    return this.pacientes;
  }

  findById(id) {
    return this.pacientes.find(paciente => paciente.id === id) ?? null;
  }

  save(paciente) {
    const index = this.pacientes.findIndex(p => p.id === paciente.id);

    if (index === -1) {
      this.pacientes.push(paciente);
    } else {
      this.pacientes[index] = paciente;
    }

    return paciente;
  }

  deleteById(id) {
    const index = this.pacientes.findIndex(paciente => paciente.id === id);

    if (index !== -1) {
      this.pacientes.splice(index, 1);
    }
  }
}

export const pacienteRepository = new PacienteRepository();
export { PacienteRepository };
