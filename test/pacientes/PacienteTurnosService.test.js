import { describe, test, expect, beforeEach } from '@jest/globals';
import { PacienteService } from '../../src/modules/pacientes/service/PacienteService.js';
import { Paciente } from '../../src/modules/pacientes/domain/Paciente.js';
import { TurnoService } from '../../src/modules/turnos/service/TurnoService.js';
import { Medico } from '../../src/modules/medicos/domain/Medico.js';
import { Especialidad } from '../../src/modules/medicos/domain/Especialidad.js';
import { DisponibilidadHoraria } from '../../src/modules/medicos/domain/DisponibilidadHoraria.js';
import { Sede } from '../../src/modules/medicos/domain/Sede.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';

// --- Mocks de repositorios ---
function buildMockTurnoRepository() {
    const turnos = [];
    return {
        get turnos() { return turnos; },
        findAll:          ()    => [...turnos],
        findById:         (id)  => turnos.find(t => t.id === id) ?? null,
        findByMedicoId:   (id)  => turnos.filter(t => t.medico.id === id),
        findByPacienteId: (id)  => turnos.filter(t => t.paciente?.id === id),
        save: (turno) => {
            const i = turnos.findIndex(t => t.id === turno.id);
            if (i === -1) turnos.push(turno); else turnos[i] = turno;
            return turno;
        },
        deleteById: (id) => {
            const i = turnos.findIndex(t => t.id === id);
            if (i !== -1) turnos.splice(i, 1);
        },
    };
}

function buildMockMedicoRepository(medicosDB) {
    return {
        findById:   (id) => medicosDB[id] ?? null,
        findAll:    ()   => Object.values(medicosDB),
        save:       (m)  => { medicosDB[m.id] = m; return m; },
        updateById: (id, data) => {
            if (!medicosDB[id]) return null;
            Object.assign(medicosDB[id], data);
            return medicosDB[id];
        },
    };
}

function buildMockMedicos() {
    const cardiologia = Especialidad.create({ id: 'esp-001', nombre: 'Cardiología', duracionTurnoEnMins: 30, costoConsulta: 5000 });
    const sedeCentral = Sede.create({ id: 'sede-001', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 123' });

    const med1 = Medico.create({
        id: 'med-001', matricula: 'MP-1234', nombre: 'Ana Gómez',
        especialidades: [cardiologia], practicas: [], sedes: [sedeCentral],
    });
    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00' }));

    return { 'med-001': med1 };
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
describe('PacienteService - Turnos', () => {
    let turnoRepo;
    let pacienteRepo;
    let pacienteService;
    let medicosDB;
    let medico;
    let especialidad;

    beforeEach(() => {
        medicosDB = buildMockMedicos();
        turnoRepo = buildMockTurnoRepository();

        pacienteRepo = {
            pacientes: [
                Paciente.create({ id: 'pac-001', usuario: { id: 'usr-001', email: 'juan@example.com' }, dni: '30111222', nombre: 'Juan Lopez',     obraSocial: 'OSDE',          plan: '210' }),
                Paciente.create({ id: 'pac-002', usuario: { id: 'usr-002', email: 'maria@example.com' }, dni: '32555666', nombre: 'Maria Fernandez', obraSocial: 'Swiss Medical', plan: 'SMG20' }),
            ],
            findById(id) { return this.pacientes.find(p => p.id === id) ?? null; },
            save(paciente) { this.pacientes.push(paciente); return paciente; },
        };

        const turnoService = new TurnoService(turnoRepo, buildMockMedicoRepository(medicosDB));
        pacienteService = new PacienteService(pacienteRepo, turnoService);

        medico      = medicosDB['med-001'];
        especialidad = medico.especialidades[0];
    });

    function datosReserva(overrides = {}) {
        return {
            id:           overrides.id ?? 'tur-pac-001',
            medicoId:     overrides.medicoId ?? medico.id,
            especialidadId: overrides.especialidadId ?? especialidad.id,
            fechaHora:    overrides.fechaHora ?? proximaFechaParaDiaYHora('LUNES', '09:20'),
            sede:         overrides.sede ?? { id: 'sede-001', nombre: 'Sede Central' },
        };
    }

    test('debería reservar un turno validando disponibilidad', async () => {
        const turno = await pacienteService.reservarTurno('pac-001', datosReserva());

        expect(turno.id).toBe('tur-pac-001');
        expect(turno.paciente.id).toBe('pac-001');
        expect(turno.medico.id).toBe('med-001');
        expect(turno.estado).toBe(EstadoTurno.RESERVADO);
    });

    test('debería rechazar una reserva fuera de disponibilidad', async () => {
        await expect(pacienteService.reservarTurno('pac-001', datosReserva({
            fechaHora: proximaFechaParaDiaYHora('MARTES', '09:20'),
        }))).rejects.toThrow('El médico no tiene disponibilidad para la fecha y horario solicitados');
    });

    test('debería cancelar un turno del paciente con motivo y una hora de anticipación', async () => {
        const turno = await pacienteService.reservarTurno('pac-001', datosReserva());

        const cancelado = await pacienteService.cancelarTurno('pac-001', turno.id, 'El paciente no puede asistir');

        expect(cancelado.estado).toBe(EstadoTurno.CANCELADO);
        expect(cancelado.historialEstados[0].motivo).toBe('El paciente no puede asistir');
        expect(cancelado.historialEstados[0].usuario.id).toBe('pac-001');
    });

    test('debería rechazar una cancelación sin motivo', async () => {
        const turno = await pacienteService.reservarTurno('pac-001', datosReserva());

        await expect(pacienteService.cancelarTurno('pac-001', turno.id, ''))
            .rejects.toThrow('El motivo de cancelación es obligatorio');
    });

    test('debería consultar el historial personal de turnos', async () => {
        await pacienteService.reservarTurno('pac-001', datosReserva({ id: 'tur-pac-001' }));
        await pacienteService.reservarTurno('pac-002', datosReserva({
            id: 'tur-pac-002',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '10:00'),
        }));

        const historial = await pacienteService.consultarHistorialTurnos('pac-001');

        expect(historial).toHaveLength(1);
        expect(historial[0].id).toBe('tur-pac-001');
    });

    test('debería cambiar un turno a otro slot disponible del mismo profesional', async () => {
        const turno = await pacienteService.reservarTurno('pac-001', datosReserva({
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20'),
        }));

        const nuevaFechaHora = proximaFechaParaDiaYHora('LUNES', '10:00');
        const actualizado = await pacienteService.cambiarTurno('pac-001', turno.id, { fechaHora: nuevaFechaHora });

        expect(actualizado.id).toBe(turno.id);
        expect(actualizado.medico.id).toBe('med-001');
        expect(actualizado.fechaHora).toEqual(nuevaFechaHora);
    });

    test('debería rechazar un cambio de turno a otro profesional', async () => {
        const turno = await pacienteService.reservarTurno('pac-001', datosReserva());

        await expect(pacienteService.cambiarTurno('pac-001', turno.id, {
            medicoId: 'med-002',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '10:00'),
        })).rejects.toThrow('El cambio de turno debe mantener el mismo profesional');
    });
});