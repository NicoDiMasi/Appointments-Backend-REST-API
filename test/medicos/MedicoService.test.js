import { describe, test, expect, beforeEach } from '@jest/globals';
import { MedicoService } from '../../src/modules/medicos/service/MedicoService.js';
import { medicoRepository } from '../../src/modules/medicos/repository/MedicoRepository.js';
import { turnoRepository } from '../../src/modules/turnos/repository/TurnoRepository.js';
import { Turno } from '../../src/modules/turnos/domain/Turno.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';

describe('MedicoService - Disponibilidades', () => {
    beforeEach(() => {
        medicoRepository._medicos = medicoRepository._initMockData();
        turnoRepository.turnos = [];
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

    function crearTurnoMedico(overrides = {}) {
        const medico = medicoRepository.findById(overrides.medicoId ?? 'med-001');
        const especialidad = medico.especialidades[0];

        return Turno.create({
            id: overrides.id ?? 'tur-med-001',
            medico,
            paciente: overrides.paciente ?? {
                id: 'pac-001',
                nombre: 'Juan Lopez',
                dni: '30111222',
            },
            fechaHora: overrides.fechaHora ?? proximaFechaParaDiaYHora('LUNES', '09:20'),
            sede: {
                id: 'sede-001',
                nombre: 'Sede Central',
            },
            especialidad,
            estado: overrides.estado ?? EstadoTurno.RESERVADO,
            historialEstados: [],
            costo: especialidad.costoConsulta,
        });
    }

    test('debería listar las disponibilidades de un médico existente', () => {
        const disponibilidades = MedicoService.listarDisponibilidades('med-001');

        expect(disponibilidades).toHaveLength(3);
        expect(disponibilidades[0]).toEqual({
            diaSemana: 'LUNES',
            horaDesde: '08:00',
            horaHasta: '12:00',
        });
    });

    test('debería agregar una disponibilidad válida a un médico existente', () => {
        const nuevaDisponibilidad = {
            diaSemana: 'MARTES',
            horaDesde: '10:00',
            horaHasta: '13:00',
        };

        const resultado = MedicoService.agregarDisponibilidad(
            'med-001',
            nuevaDisponibilidad
        );

        expect(resultado).toEqual(nuevaDisponibilidad);

        const disponibilidades = MedicoService.listarDisponibilidades('med-001');
        expect(disponibilidades).toContainEqual(nuevaDisponibilidad);
    });

    test('debería rechazar una disponibilidad con horaDesde posterior a horaHasta', () => {
        const disponibilidadInvalida = {
            diaSemana: 'MARTES',
            horaDesde: '14:00',
            horaHasta: '10:00',
        };

        expect(() => {
            MedicoService.agregarDisponibilidad('med-001', disponibilidadInvalida);
        }).toThrow('horaDesde debe ser anterior a horaHasta');
    });

    test('debería rechazar una disponibilidad duplicada para el mismo día', () => {
        const disponibilidadDuplicada = {
            diaSemana: 'LUNES',
            horaDesde: '15:00',
            horaHasta: '18:00',
        };

        expect(() => {
            MedicoService.agregarDisponibilidad('med-001', disponibilidadDuplicada);
        }).toThrow('Ya existe una disponibilidad para el día LUNES');
    });

    test('debería actualizar una disponibilidad existente', () => {
        const resultado = MedicoService.actualizarDisponibilidad(
            'med-001',
            'LUNES',
            {
                horaDesde: '09:00',
                horaHasta: '12:30',
            }
        );

        expect(resultado).toEqual({
            diaSemana: 'LUNES',
            horaDesde: '09:00',
            horaHasta: '12:30',
        });
    });

    test('debería eliminar una disponibilidad existente', () => {
        MedicoService.eliminarDisponibilidad('med-001', 'LUNES');

        const disponibilidades = MedicoService.listarDisponibilidades('med-001');

        expect(disponibilidades).not.toContainEqual({
            diaSemana: 'LUNES',
            horaDesde: '08:00',
            horaHasta: '12:00',
        });
    });

    test('debería lanzar error si el médico no existe', () => {
        expect(() => {
            MedicoService.listarDisponibilidades('med-inexistente');
        }).toThrow("Médico con id 'med-inexistente' no encontrado");
    });

    test('debería consultar turnos de un paciente para un médico', () => {
        turnoRepository.save(crearTurnoMedico({ id: 'tur-med-001' }));
        turnoRepository.save(crearTurnoMedico({
            id: 'tur-med-002',
            paciente: { id: 'pac-002', nombre: 'Maria Fernandez', dni: '32555666' },
            fechaHora: proximaFechaParaDiaYHora('LUNES', '10:00'),
        }));

        const turnos = MedicoService.consultarTurnosDePaciente('med-001', 'pac-001');

        expect(turnos).toHaveLength(1);
        expect(turnos[0].id).toBe('tur-med-001');
    });

    test('debería cancelar un turno del médico con motivo', () => {
        const turno = crearTurnoMedico();
        turnoRepository.save(turno);

        const cancelado = MedicoService.actualizarTurno('med-001', turno.id, {
            estado: EstadoTurno.CANCELADO,
            motivo: 'El médico no puede atender',
        });

        expect(cancelado.estado).toBe(EstadoTurno.CANCELADO);
        expect(cancelado.historialEstados[0].motivo).toBe('El médico no puede atender');
        expect(cancelado.historialEstados[0].usuario.id).toBe('med-001');
    });

    test('debería consultar disponibilidad del médico para una especialidad', () => {
        const resultado = MedicoService.consultarDisponibilidadTurno('med-001', {
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20').toISOString(),
            especialidadId: 'esp-001',
        });

        expect(resultado.disponible).toBe(true);
        expect(resultado.medicoId).toBe('med-001');
        expect(resultado.duracionPrestacion).toBe(30);
    });

    test('debería consultar disponibilidad del médico para una práctica', () => {
        const resultado = MedicoService.consultarDisponibilidadTurno('med-001', {
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20').toISOString(),
            tipoPrestacion: 'practica',
            practicaId: 'pra-001',
        });

        expect(resultado.disponible).toBe(true);
        expect(resultado.medicoId).toBe('med-001');
        expect(resultado.duracionPrestacion).toBe(45);
    });
});
