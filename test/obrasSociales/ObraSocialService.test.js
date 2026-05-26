import { jest, describe, expect, test, beforeEach } from '@jest/globals';
import { ObraSocial } from '../../src/modules/obrasSociales/domain/ObraSocial.js';
import { Plan } from '../../src/modules/obrasSociales/domain/Plan.js';
import { CoberturaEspecialidad } from '../../src/modules/obrasSociales/domain/CoberturaEspecialidad.js';
import { CoberturaPractica } from '../../src/modules/obrasSociales/domain/CoberturaPractica.js';
import { NivelCobertura } from '../../src/modules/obrasSociales/domain/NivelCobertura.js';

// --- Mock del repositorio ---
const mockFindAll      = jest.fn();
const mockFindById     = jest.fn();
const mockFindPlanById = jest.fn();
const mockSave         = jest.fn();

jest.unstable_mockModule('../../src/modules/obrasSociales/repository/ObraSocialRepository.js', () => ({
    ObraSocialRepository: class {
        findAll()                    { return mockFindAll(); }
        findById(id)                 { return mockFindById(id); }
        findPlanById(osId, planId)   { return mockFindPlanById(osId, planId); }
        save(os)                     { return mockSave(os); }
    },
    obraSocialRepository: {
        findAll:      ()              => mockFindAll(),
        findById:     (id)            => mockFindById(id),
        findPlanById: (osId, planId)  => mockFindPlanById(osId, planId),
        save:         (os)            => mockSave(os),
    },
}));

const { ObraSocialService } = await import('../../src/modules/obrasSociales/service/ObraSocialService.js');

// --- Datos de prueba ---
function buildMockObrasSociales() {
    const cardiologia       = { id: 'esp-001', nombre: 'Cardiología' };
    const clinicaMedica     = { id: 'esp-004', nombre: 'Clínica Médica' };
    const neurologia        = { id: 'esp-002', nombre: 'Neurología' };
    const electrocardiograma = { id: 'pra-001', nombre: 'Electrocardiograma' };

    return [
        ObraSocial.create({
            id: 'os-001',
            nombre: 'OSDE',
            planes: [
                Plan.create({
                    id: 'plan-210',
                    nombre: '210',
                    coberturasEspecialidad: [
                        CoberturaEspecialidad.create({ especialidad: cardiologia,   nivel: NivelCobertura.PARCIAL }),
                        CoberturaEspecialidad.create({ especialidad: clinicaMedica, nivel: NivelCobertura.TOTAL }),
                        CoberturaEspecialidad.create({ especialidad: neurologia,    nivel: NivelCobertura.NO_CUBIERTA }),
                    ],
                    coberturasPractica: [
                        CoberturaPractica.create({ practica: electrocardiograma, nivel: NivelCobertura.PARCIAL }),
                    ],
                }),
            ],
        }),
        ObraSocial.create({
            id: 'os-002',
            nombre: 'Swiss Medical',
            planes: [
                Plan.create({
                    id: 'plan-smg20',
                    nombre: 'SMG20',
                    coberturasEspecialidad: [
                        CoberturaEspecialidad.create({ especialidad: cardiologia, nivel: NivelCobertura.TOTAL }),
                        CoberturaEspecialidad.create({ especialidad: neurologia,  nivel: NivelCobertura.PARCIAL }),
                    ],
                    coberturasPractica: [
                        CoberturaPractica.create({ practica: electrocardiograma, nivel: NivelCobertura.TOTAL }),
                    ],
                }),
            ],
        }),
    ];
}

// --- Suite ---
describe('ObraSocialService', () => {
    let obrasSociales;

    beforeEach(() => {
        obrasSociales = buildMockObrasSociales();
        mockFindAll.mockReturnValue(obrasSociales);
        mockFindById.mockImplementation(id => obrasSociales.find(os => os.id === id) ?? null);
        mockFindPlanById.mockImplementation((osId, planId) => {
            const os = obrasSociales.find(o => o.id === osId);
            return os?.planes.find(p => p.id === planId) ?? null;
        });
    });

    test('deberia listar obras sociales con planes y coberturas', async () => {
        const result = await ObraSocialService.listar();

        expect(result).toHaveLength(2);
        expect(result[0].planes).toHaveLength(1);
        expect(result[0].planes[0].coberturasEspecialidad.length).toBeGreaterThan(0);
        expect(result[0].planes[0].coberturasPractica.length).toBeGreaterThan(0);
    });

    test('deberia buscar una obra social por id', async () => {
        const obraSocial = await ObraSocialService.buscarPorId('os-001');

        expect(obraSocial.nombre).toBe('OSDE');
    });

    test('deberia listar planes de una obra social', async () => {
        const planes = await ObraSocialService.listarPlanes('os-001');

        expect(planes.map(plan => plan.id)).toEqual(['plan-210']);
    });

    test('deberia buscar un plan por id', async () => {
        const plan = await ObraSocialService.buscarPlan('os-002', 'plan-smg20');

        expect(plan.nombre).toBe('SMG20');
    });

    test('deberia rechazar un nivel de cobertura invalido', () => {
        expect(() => {
            CoberturaEspecialidad.create({
                especialidad: { id: 'esp-001', nombre: 'Cardiologia' },
                nivel: 'COMPLETA',
            });
        }).toThrow('nivel invalido');
    });

    test('deberia crear una obra social con planes vacios por defecto', () => {
        const obraSocial = ObraSocial.create({
            id: 'os-003',
            nombre: 'Galeno',
        });

        expect(obraSocial.planes).toEqual([]);
    });

    test('deberia exponer los niveles de cobertura esperados', () => {
        expect(NivelCobertura).toEqual({
            TOTAL: 'TOTAL',
            PARCIAL: 'PARCIAL',
            NO_CUBIERTA: 'NO_CUBIERTA',
        });
    });
});