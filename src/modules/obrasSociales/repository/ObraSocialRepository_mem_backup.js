import { medicoRepository } from '../../medicos/repository/MedicoRepository.js';
import { ObraSocial } from '../domain/ObraSocial.js';
import { NivelCobertura } from '../domain/NivelCobertura.js';

export class ObraSocialRepository {
  constructor() {
    if (ObraSocialRepository._instance) {
      return ObraSocialRepository._instance;
    }

    ObraSocialRepository._instance = this;
    this.obrasSociales = this._initMockData();
  }

  findAll() {
    return this.obrasSociales;
  }

  findById(id) {
    return this.obrasSociales.find(obraSocial => obraSocial.id === id) ?? null;
  }

  findPlanById(obraSocialId, planId) {
    const obraSocial = this.findById(obraSocialId);

    return obraSocial?.planes.find(plan => plan.id === planId) ?? null;
  }

  save(obraSocial) {
    const index = this.obrasSociales.findIndex(os => os.id === obraSocial.id);

    if (index === -1) {
      this.obrasSociales.push(obraSocial);
    } else {
      this.obrasSociales[index] = obraSocial;
    }

    return obraSocial;
  }

  _initMockData() {
    const medico1 = medicoRepository.findById('med-001');
    const medico2 = medicoRepository.findById('med-002');

    const cardiologia = medico1.especialidades.find(e => e.id === 'esp-001');
    const clinicaMedica = medico1.especialidades.find(e => e.id === 'esp-004');
    const neurologia = medico2.especialidades.find(e => e.id === 'esp-002');
    const electrocardiograma = medico1.practicas.find(p => p.id === 'pra-001');

    return [
      ObraSocial.create({
        id: 'os-001',
        nombre: 'OSDE',
        planes: [
          {
            id: 'plan-210',
            nombre: '210',
            coberturasEspecialidad: [
              { especialidad: cardiologia, nivel: NivelCobertura.PARCIAL },
              { especialidad: clinicaMedica, nivel: NivelCobertura.TOTAL },
              { especialidad: neurologia, nivel: NivelCobertura.NO_CUBIERTA },
            ],
            coberturasPractica: [
              { practica: electrocardiograma, nivel: NivelCobertura.PARCIAL },
            ],
          },
        ],
      }),
      ObraSocial.create({
        id: 'os-002',
        nombre: 'Swiss Medical',
        planes: [
          {
            id: 'plan-smg20',
            nombre: 'SMG20',
            coberturasEspecialidad: [
              { especialidad: cardiologia, nivel: NivelCobertura.TOTAL },
              { especialidad: neurologia, nivel: NivelCobertura.PARCIAL },
            ],
            coberturasPractica: [
              { practica: electrocardiograma, nivel: NivelCobertura.TOTAL },
            ],
          },
        ],
      }),
    ];
  }
}

export const obraSocialRepository = new ObraSocialRepository();

