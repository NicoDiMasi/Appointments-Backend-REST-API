import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { Medico } from '../../src/modules/medicos/domain/Medico.js';
import { Especialidad } from '../../src/modules/medicos/domain/Especialidad.js';
import { Practica } from '../../src/modules/medicos/domain/Practica.js';
import { DisponibilidadHoraria } from '../../src/modules/medicos/domain/DisponibilidadHoraria.js';
import { Sede } from '../../src/modules/medicos/domain/Sede.js';
import { Turno } from '../../src/modules/turnos/domain/Turno.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';

// --- Mocks (deben ir antes del import del service) ---
const mockFindById = jest.fn();
const mockSave = jest.fn();
const mockUpdateById = jest.fn();

await jest.unstable_mockModule('../../src/modules/medicos/repository/MedicoRepository.js', () => ({
    medicoRepository: {
        findById: mockFindById,
        save: mockSave,
        updateById: mockUpdateById,
        findAll: jest.fn(),
    }
}));

// Mock de TurnoRepository para evitar que su _initMockData() llame a medicoRepository en el constructor
await jest.unstable_mockModule('../../src/modules/turnos/repository/TurnoRepository.js', () => {
    class MockTurnoRepository {
        constructor() { this.turnos = []; }
        findAll() { return this.turnos; }
        save(turno) {
            const i = this.turnos.findIndex(t => t.id === turno.id);
            if (i === -1) this.turnos.push(turno); else this.turnos[i] = turno;
            return turno;
        }
        findById(id) { return this.turnos.find(t => t.id === id) ?? null; }
        findByMedicoId(id) { return this.turnos.filter(t => t.medico.id === id); }
        findByPacienteId(id) { return this.turnos.filter(t => t.paciente?.id === id); }
        deleteById(id) { const i = this.turnos.findIndex(t => t.id === id); if (i !== -1) this.turnos.splice(i, 1); }
    }
    return { TurnoRepository: MockTurnoRepository, turnoRepository: new MockTurnoRepository() };
});

const { MedicoService } = await import('../../src/modules/medicos/service/MedicoService.js');
const { turnoRepository } = await import('../../src/modules/turnos/repository/TurnoRepository.js');

// --- Helpers ---
function buildMockMedicos() {
    const cardiologia   = Especialidad.create({ id: 'esp-001', nombre: 'Cardiología',    duracionTurnoEnMins: 30, costoConsulta: 5000 });
    const neurologia    = Especialidad.create({ id: 'esp-002', nombre: 'Neurología',     duracionTurnoEnMins: 45, costoConsulta: 7000 });
    const pediatria     = Especialidad.create({ id: 'esp-003', nombre: 'Pediatría',      duracionTurnoEnMins: 20, costoConsulta: 4000 });
    const clinicaMedica = Especialidad.create({ id: 'esp-004', nombre: 'Clínica Médica', duracionTurnoEnMins: 30, costoConsulta: 3500 });

    const electrocardiograma  = Practica.create({ id: 'pra-001', codigo: 'ECG',      nombre: 'Electrocardiograma',  duracionTurnoEnMins: 45, costo: 6000 });
    const electroencefalograma = Practica.create({ id: 'pra-002', codigo: 'EEG',     nombre: 'Electroencefalograma', duracionTurnoEnMins: 60, costo: 9000 });
    const controlPediatrico   = Practica.create({ id: 'pra-003', codigo: 'PED-CTRL', nombre: 'Control pediatrico',  duracionTurnoEnMins: 30, costo: 4500 });

    const sedeCentral = Sede.create({ id: 'sede-001', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 123' });
    const sedeNorte   = Sede.create({ id: 'sede-002', nombre: 'Sede Norte',   direccion: 'Calle Falsa 456' });
    const sedeSur     = Sede.create({ id: 'sede-003', nombre: 'Sede Sur',     direccion: 'San Martin 789' });

    const med1 = Medico.create({ id: 'med-001', matricula: 'MP-1234', nombre: 'Ana Gómez',      especialidades: [cardiologia, clinicaMedica], practicas: [electrocardiograma],  sedes: [sedeCentral, sedeNorte] });
    const med2 = Medico.create({ id: 'med-002', matricula: 'MP-5678', nombre: 'Carlos Pérez',   especialidades: [neurologia],                 practicas: [electroencefalograma], sedes: [sedeNorte] });
    const med3 = Medico.create({ id: 'med-003', matricula: 'MP-9012', nombre: 'Laura Martínez', especialidades: [pediatria],                  practicas: [controlPediatrico],    sedes: [sedeSur] });

    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'LUNES',     horaDesde: '08:00', horaHasta: '12:00' }));
    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MIERCOLES', horaDesde: '14:00', horaHasta: '18:00' }));
    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'VIERNES',   horaDesde: '09:00', horaHasta: '13:00' }));

    med2.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MARTES',  horaDesde: '07:00', horaHasta: '11:00' }));
    med2.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'JUEVES',  horaDesde: '15:00', horaHasta: '19:00' }));
    med2.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'SABADO',  horaDesde: '08:00', horaHasta: '12:00' }));

    med3.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'LUNES',     horaDesde: '10:00', horaHasta: '14:00' }));
    med3.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MIERCOLES', horaDesde: '16:00', horaHasta: '20:00' }));
    med3.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'VIERNES',   horaDesde: '08:30', horaHasta: '12:30' }));

    return { 'med-001': med1, 'med-002': med2, 'med-003': med3 };
}

function proximaFechaParaDiaYHora(diaSemana, hora) {
    const dias = { DOMINGO: 0, LUNES: 1, MARTES: 2, MIERCOLES: 3, JUEVES: 4, VIERNES: 5, SABADO: 6 };
    const fecha = new Date();
    const diferenciaDias = (dias[diaSemana] - fecha.getDay() + 7) % 7 || 7;
    fecha.setDate(fecha.getDate() + diferenciaDias);
    const [horas, minutos] = hora.split(':').map(Number);
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
}

// --- Suite ---
describe('MedicoService', () => {
    let medicosDB;

    beforeEach(() => {
        medicosDB = buildMockMedicos();

        mockFindById.mockImplementation((id) => medicosDB[id] ?? null);
        mockSave.mockImplementation((medico) => medico);
        mockUpdateById.mockImplementation((id, data) => {
            if (!medicosDB[id]) return null;
            Object.assign(medicosDB[id], data);
            return medicosDB[id];
        });

        turnoRepository.turnos = [];
    });

    function crearTurnoMedico(overrides = {}) {
        const medico = medicosDB[overrides.medicoId ?? 'med-001'];
        const especialidad = medico.especialidades[0];
        return Turno.create({
            id: overrides.id ?? 'tur-med-001',
            medico,
            paciente: overrides.paciente ?? { id: 'pac-001', nombre: 'Juan Lopez', dni: '30111222' },
            fechaHora: overrides.fechaHora ?? proximaFechaParaDiaYHora('LUNES', '09:20'),
            sede: { id: 'sede-001', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 123' },
            especialidad,
            estado: overrides.estado ?? EstadoTurno.RESERVADO,
            historialEstados: [],
            costo: especialidad.costoConsulta,
        });
    }

    // --- Disponibilidades ---
    test('debería listar las disponibilidades de un médico existente', async () => {
        const disponibilidades = await MedicoService.listarDisponibilidades('med-001');

        expect(disponibilidades).toHaveLength(3);
        expect(disponibilidades[0]).toEqual({ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00' });
    });

    test('debería agregar una disponibilidad válida a un médico existente', async () => {
        const nuevaDisponibilidad = { diaSemana: 'MARTES', horaDesde: '10:00', horaHasta: '13:00' };

        const resultado = await MedicoService.agregarDisponibilidad('med-001', nuevaDisponibilidad);

        expect(resultado).toEqual(nuevaDisponibilidad);

        const disponibilidades = await MedicoService.listarDisponibilidades('med-001');
        expect(disponibilidades).toContainEqual(nuevaDisponibilidad);
    });

    test('debería rechazar una disponibilidad con horaDesde posterior a horaHasta', async () => {
        await expect(MedicoService.agregarDisponibilidad('med-001', {
            diaSemana: 'MARTES', horaDesde: '14:00', horaHasta: '10:00',
        })).rejects.toThrow('horaDesde debe ser anterior a horaHasta');
    });

    test('debería rechazar una disponibilidad duplicada para el mismo día', async () => {
        await expect(MedicoService.agregarDisponibilidad('med-001', {
            diaSemana: 'LUNES', horaDesde: '15:00', horaHasta: '18:00',
        })).rejects.toThrow('Ya existe una disponibilidad para el día LUNES');
    });

    test('debería actualizar una disponibilidad existente', async () => {
        const resultado = await MedicoService.actualizarDisponibilidad('med-001', 'LUNES', {
            horaDesde: '09:00', horaHasta: '12:30',
        });

        expect(resultado).toEqual({ diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '12:30' });
    });

    test('debería eliminar una disponibilidad existente', async () => {
        await MedicoService.eliminarDisponibilidad('med-001', 'LUNES');

        const disponibilidades = await MedicoService.listarDisponibilidades('med-001');
        expect(disponibilidades).not.toContainEqual({ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00' });
    });

    // --- Servicios (especialidades y prácticas) ---
    test('deberia listar los servicios de un medico', async () => {
        const servicios = await MedicoService.listarServicios('med-001');

        expect(servicios.especialidades).toHaveLength(2);
        expect(servicios.practicas).toHaveLength(1);
        expect(servicios.especialidades[0].id).toBe('esp-001');
        expect(servicios.practicas[0].id).toBe('pra-001');
    });

    test('deberia agregar una especialidad como servicio', async () => {
        const servicio = await MedicoService.agregarServicio('med-001', {
            tipo: 'especialidad', id: 'esp-010', nombre: 'Dermatologia', duracionTurnoEnMins: 20, costoConsulta: 4500,
        });

        expect(servicio.id).toBe('esp-010');
        expect(medicosDB['med-001'].especialidades).toContainEqual(servicio);
    });

    test('deberia agregar una practica como servicio', async () => {
        const servicio = await MedicoService.agregarServicio('med-001', {
            tipo: 'practica', id: 'pra-010', codigo: 'ECO', nombre: 'Ecografia', duracionTurnoEnMins: 40, costo: 8000,
        });

        expect(servicio.id).toBe('pra-010');
        expect(medicosDB['med-001'].practicas).toContainEqual(servicio);
    });

    test('deberia rechazar un servicio duplicado', async () => {
        await expect(MedicoService.agregarServicio('med-001', {
            tipo: 'especialidad', id: 'esp-001', nombre: 'Cardiologia', duracionTurnoEnMins: 30, costoConsulta: 5000,
        })).rejects.toThrow("Ya existe un servicio de tipo 'especialidad' con id 'esp-001'");
    });

    test('deberia actualizar un servicio existente', async () => {
        const servicio = await MedicoService.actualizarServicio('med-001', 'practica', 'pra-001', {
            costo: 6500, duracionTurnoEnMins: 60,
        });

        expect(servicio.id).toBe('pra-001');
        expect(servicio.costo).toBe(6500);
        expect(servicio.duracionTurnoEnMins).toBe(60);
    });

    test('deberia eliminar un servicio existente', async () => {
        await MedicoService.eliminarServicio('med-001', 'especialidad', 'esp-004');

        expect(medicosDB['med-001'].especialidades.map(e => e.id)).not.toContain('esp-004');
    });

    // --- Errores ---
    test('debería lanzar error si el médico no existe', async () => {
        await expect(MedicoService.listarDisponibilidades('med-inexistente'))
            .rejects.toThrow("Médico con id 'med-inexistente' no encontrado");
    });

    // --- Turnos ---
    test('debería consultar turnos de un paciente para un médico', async () => {
        turnoRepository.save(crearTurnoMedico({ id: 'tur-med-001' }));
        turnoRepository.save(crearTurnoMedico({
            id: 'tur-med-002',
            paciente: { id: 'pac-002', nombre: 'Maria Fernandez', dni: '32555666' },
            fechaHora: proximaFechaParaDiaYHora('LUNES', '10:00'),
        }));

        const turnos = await MedicoService.consultarTurnosDePaciente('med-001', 'pac-001');

        expect(turnos).toHaveLength(1);
        expect(turnos[0].id).toBe('tur-med-001');
    });

    test('debería cancelar un turno del médico con motivo', async () => {
        const turno = crearTurnoMedico();
        turnoRepository.save(turno);

        const cancelado = await MedicoService.actualizarTurno('med-001', turno.id, {
            estado: EstadoTurno.CANCELADO,
            motivo: 'El médico no puede atender',
        });

        expect(cancelado.estado).toBe(EstadoTurno.CANCELADO);
        expect(cancelado.historialEstados[0].motivo).toBe('El médico no puede atender');
        expect(cancelado.historialEstados[0].usuario.id).toBe('med-001');
    });

    test('debería consultar disponibilidad del médico para una especialidad', async () => {
        const resultado = await MedicoService.consultarDisponibilidadTurno('med-001', {
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20').toISOString(),
            especialidadId: 'esp-001',
        });

        expect(resultado.disponible).toBe(true);
        expect(resultado.medicoId).toBe('med-001');
        expect(resultado.duracionPrestacion).toBe(30);
    });

    test('debería consultar disponibilidad del médico para una práctica', async () => {
        const resultado = await MedicoService.consultarDisponibilidadTurno('med-001', {
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20').toISOString(),
            tipoPrestacion: 'practica',
            practicaId: 'pra-001',
        });

        expect(resultado.disponible).toBe(true);
        expect(resultado.medicoId).toBe('med-001');
        expect(resultado.duracionPrestacion).toBe(45);
    });
});