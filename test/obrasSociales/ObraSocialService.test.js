import { describe, expect, test } from '@jest/globals';

import { CoberturaEspecialidad } from '../../src/modules/obrasSociales/domain/CoberturaEspecialidad.js';
import { NivelCobertura } from '../../src/modules/obrasSociales/domain/NivelCobertura.js';
import { ObraSocial } from '../../src/modules/obrasSociales/domain/ObraSocial.js';
import { ObraSocialService } from '../../src/modules/obrasSociales/service/ObraSocialService.js';

describe('ObraSocialService', () => {
  test('deberia listar obras sociales con planes y coberturas', () => {
    const obrasSociales = ObraSocialService.listar();

    expect(obrasSociales).toHaveLength(2);
    expect(obrasSociales[0].planes).toHaveLength(1);
    expect(obrasSociales[0].planes[0].coberturasEspecialidad.length).toBeGreaterThan(0);
    expect(obrasSociales[0].planes[0].coberturasPractica.length).toBeGreaterThan(0);
  });

  test('deberia buscar una obra social por id', () => {
    const obraSocial = ObraSocialService.buscarPorId('os-001');

    expect(obraSocial.nombre).toBe('OSDE');
  });

  test('deberia listar planes de una obra social', () => {
    const planes = ObraSocialService.listarPlanes('os-001');

    expect(planes.map(plan => plan.id)).toEqual(['plan-210']);
  });

  test('deberia buscar un plan por id', () => {
    const plan = ObraSocialService.buscarPlan('os-002', 'plan-smg20');

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

