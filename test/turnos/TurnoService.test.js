import { describe, test, expect, beforeEach } from '@jest/globals';

import { TurnoService } from '../../src/modules/turnos/service/TurnoService.js';
import { TurnoRepository } from '../../src/modules/turnos/repository/TurnoRepository.js';
import { medicoRepository } from '../../src/modules/medicos/repository/MedicoRepository.js';
import { Turno } from '../../src/modules/turnos/domain/Turno.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';

describe('TurnoService', () => {
    let turnoRepository;
    let turnoService;

    let medico;
    let especialidad;
    let paciente;
    let sede;

    beforeEach(() => {
        medicoRepository._medicos = medicoRepository._initMockData();

        turnoRepository = new TurnoRepository();
        turnoRepository.turnos = [];

        turnoService = new TurnoService(turnoRepository);

        medico = medicoRepository.findById('med-001');
        especialidad = medico.especialidades[0];

        paciente = {
            id: 'pac-001',
            nombre: 'Juan López',
            dni: '30111222',
        };

        sede = {
            id: 'sede-001',
            nombre: 'Sede Central',
            direccion: 'Av. Siempre Viva 123',
        };
    });

    function proximaFechaParaDiaYHora(diaSemana, hora) {
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

    function crearDatosTurno(overrides = {}) {
        return {
            id: overrides.id ?? 'tur-001',
            medico: overrides.medico ?? medico,
            paciente: Object.prototype.hasOwnProperty.call(overrides, 'paciente')
                ? overrides.paciente
                : paciente,
            fechaHora: overrides.fechaHora ?? proximaFechaParaDiaYHora('LUNES', '08:40'),
            sede: Object.prototype.hasOwnProperty.call(overrides, 'sede')
                ? overrides.sede
                : sede,
            especialidad: overrides.especialidad ?? especialidad,
            practica: overrides.practica ?? null,
            estado: overrides.estado ?? EstadoTurno.CONFIRMADO,
            historialEstados: overrides.historialEstados ?? [],
            costo: overrides.costo ?? especialidad.costoConsulta,
        };
    }

    function crearTurno(overrides = {}) {
        return Turno.create(crearDatosTurno(overrides));
    }

    test('debería listar todos los turnos guardados', () => {
        const turno1 = crearTurno({ id: 'tur-001' });
        const turno2 = crearTurno({
            id: 'tur-002',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20'),
        });

        turnoRepository.save(turno1);
        turnoRepository.save(turno2);

        const turnos = turnoService.findAll();

        expect(turnos).toHaveLength(2);
        expect(turnos).toContain(turno1);
        expect(turnos).toContain(turno2);
    });

    test('debería buscar un turno existente por id', () => {
        const turno = crearTurno({ id: 'tur-001' });

        turnoRepository.save(turno);

        const resultado = turnoService.findById('tur-001');

        expect(resultado).toEqual(turno);
    });

    test('debería lanzar error si el turno no existe', () => {
        expect(() => {
            turnoService.findById('tur-inexistente');
        }).toThrow("Turno con id 'tur-inexistente' no encontrado");
    });

    test('debería crear un turno válido cuando el médico tiene disponibilidad', () => {
        const datosTurno = crearDatosTurno({
            id: 'tur-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40'),
        });

        const resultado = turnoService.crearTurno(datosTurno);

        expect(resultado.id).toBe('tur-001');
        expect(resultado.medico.id).toBe('med-001');
        expect(resultado.paciente).toEqual(paciente);
        expect(resultado.sede).toEqual(sede);
        expect(resultado.especialidad).toEqual(especialidad);
        expect(resultado.estado).toBe(EstadoTurno.CONFIRMADO);
        expect(resultado.costo).toBe(especialidad.costoConsulta);

        expect(turnoService.findAll()).toHaveLength(1);
        expect(turnoService.findAll()).toContain(resultado);
    });

    test('debería crear un turno disponible sin paciente ni sede', () => {
        const datosTurno = crearDatosTurno({
            id: 'tur-001',
            paciente: null,
            sede: null,
            estado: EstadoTurno.DISPONIBLE,
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:00'),
        });

        const resultado = turnoService.crearTurno(datosTurno);

        expect(resultado.id).toBe('tur-001');
        expect(resultado.paciente).toBeNull();
        expect(resultado.sede).toBeNull();
        expect(resultado.estado).toBe(EstadoTurno.DISPONIBLE);
    });

    test('debería rechazar un turno fuera de la disponibilidad del médico', () => {
        const datosTurno = crearDatosTurno({
            fechaHora: proximaFechaParaDiaYHora('MARTES', '08:30'),
        });

        expect(() => {
            turnoService.crearTurno(datosTurno);
        }).toThrow('El médico no tiene disponibilidad para la fecha y horario solicitados');
    });

    test('debería rechazar un turno superpuesto con otro turno del mismo médico', () => {
        const turnoExistente = crearTurno({
            id: 'tur-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40'),
        });

        turnoRepository.save(turnoExistente);

        const datosTurnoSuperpuesto = crearDatosTurno({
            id: 'tur-002',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:45'),
        });

        expect(() => {
            turnoService.crearTurno(datosTurnoSuperpuesto);
        }).toThrow('El médico no tiene disponibilidad para la fecha y horario solicitados');
    });

    test('debería consultar disponibilidad y reportar turnos cercanos', () => {
        const turnoExistente = crearTurno({
            id: 'tur-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:00'),
        });

        turnoRepository.save(turnoExistente);

        const resultado = turnoService.consultarDisponibilidad({
            medicoId: 'med-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:20').toISOString(),
            especialidadId: 'esp-001',
        });

        expect(resultado.disponible).toBe(false);
        expect(resultado.turnosCercanos).toHaveLength(1);
        expect(resultado.turnosCercanos[0].id).toBe('tur-001');
        expect(resultado.turnosCercanos[0].seSuperpone).toBe(true);
    });

    test('debería actualizar un turno existente', () => {
        const turno = crearTurno({
            id: 'tur-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40'),
        });

        turnoRepository.save(turno);

        const nuevaFechaHora = proximaFechaParaDiaYHora('LUNES', '10:00');
        const nuevaSede = {
            id: 'sede-002',
            nombre: 'Sede Norte',
            direccion: 'Calle Falsa 456',
        };

        const resultado = turnoService.actualizarTurno('tur-001', {
            fechaHora: nuevaFechaHora,
            sede: nuevaSede,
            costo: 6500,
        });

        expect(resultado.id).toBe('tur-001');
        expect(resultado.fechaHora).toEqual(nuevaFechaHora);
        expect(resultado.sede).toEqual(nuevaSede);
        expect(resultado.costo).toBe(6500);
    });

    test('debería rechazar la actualización de un turno inexistente', () => {
        expect(() => {
            turnoService.actualizarTurno('tur-inexistente', {
                costo: 6500,
            });
        }).toThrow("Turno con id 'tur-inexistente' no encontrado");
    });

    test('debería rechazar la actualización con fecha inválida', () => {
        const turno = crearTurno({ id: 'tur-001' });
        turnoRepository.save(turno);

        expect(() => {
            turnoService.actualizarTurno('tur-001', {
                fechaHora: 'fecha-invalida',
            });
        }).toThrow('La fecha y hora del turno no es válida');
    });

    test('debería rechazar la actualización con costo negativo', () => {
        const turno = crearTurno({ id: 'tur-001' });
        turnoRepository.save(turno);

        expect(() => {
            turnoService.actualizarTurno('tur-001', {
                costo: -100,
            });
        }).toThrow('El costo debe ser un número mayor o igual a cero');
    });

    test('debería dar de baja un turno existente', () => {
        const turno = crearTurno({
            id: 'tur-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40'),
        });

        turnoRepository.save(turno);

        const usuario = {
            id: 'usr-001',
            nombre: 'Recepcionista',
        };

        const resultado = turnoService.darDeBajaTurno(
            'tur-001',
            usuario,
            'El paciente canceló el turno'
        );

        expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
        expect(resultado.historialEstados).toHaveLength(1);
        expect(resultado.historialEstados[0].estado).toBe(EstadoTurno.CANCELADO);
        expect(resultado.historialEstados[0].usuario).toEqual(usuario);
        expect(resultado.historialEstados[0].motivo).toBe('El paciente canceló el turno');
    });

    test('debería rechazar la baja de un turno inexistente', () => {
        expect(() => {
            turnoService.darDeBajaTurno(
                'tur-inexistente',
                { id: 'usr-001', nombre: 'Recepcionista' },
                'Motivo de baja'
            );
        }).toThrow("Turno con id 'tur-inexistente' no encontrado");
    });

    test('debería rechazar la baja si falta menos de una hora para el turno', () => {
        const fechaHora = new Date(Date.now() + 30 * 60 * 1000);

        const turno = crearTurno({
            id: 'tur-001',
            fechaHora,
        });

        turnoRepository.save(turno);

        expect(() => {
            turnoService.darDeBajaTurno(
                'tur-001',
                { id: 'usr-001', nombre: 'Recepcionista' },
                'Baja fuera de tiempo'
            );
        }).toThrow('El turno solo puede darse de baja hasta una hora antes del horario del mismo');
    });

    test('debería eliminar un turno existente', () => {
        const turno = crearTurno({
            id: 'tur-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40'),
        });

        turnoRepository.save(turno);

        turnoService.eliminarTurno('tur-001');

        expect(turnoService.findAll()).toHaveLength(0);
    });

    test('debería rechazar la eliminación de un turno inexistente', () => {
        expect(() => {
            turnoService.eliminarTurno('tur-inexistente');
        }).toThrow("Turno con id 'tur-inexistente' no encontrado");
    });
});
