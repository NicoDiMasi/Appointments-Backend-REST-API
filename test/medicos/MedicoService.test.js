import { describe, test, expect, beforeEach } from '@jest/globals';
import { MedicoService } from '../../src/modules/medicos/service/MedicoService.js';
import { medicoRepository } from '../../src/modules/medicos/repository/MedicoRepository.js';

describe('MedicoService - Disponibilidades', () => {
    beforeEach(() => {
        medicoRepository._medicos = medicoRepository._initMockData();
    });

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
});