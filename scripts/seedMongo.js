import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { medicoModel } from '../src/modules/medicos/schemas/MedicoSchema.js';
import { pacienteModel } from '../src/modules/pacientes/schemas/pacienteSchema.js';
import { obraSocialModel } from '../src/modules/obrasSociales/schemas/ObraSocialSchema.js';

//Este script sirve para cargar algunos datos de prueba a Mongo. Una vez se ejecuta, ya quedan persistidos

dotenv.config();

const especialidades = {
  cardiologia: {
    id: 'esp-001',
    nombre: 'Cardiologia',
    duracionTurnoEnMins: 30,
    costoConsulta: 5000,
  },
  neurologia: {
    id: 'esp-002',
    nombre: 'Neurologia',
    duracionTurnoEnMins: 45,
    costoConsulta: 7000,
  },
  pediatria: {
    id: 'esp-003',
    nombre: 'Pediatria',
    duracionTurnoEnMins: 20,
    costoConsulta: 4000,
  },
  clinicaMedica: {
    id: 'esp-004',
    nombre: 'Clinica Medica',
    duracionTurnoEnMins: 30,
    costoConsulta: 3500,
  },
};

const practicas = {
  electrocardiograma: {
    id: 'pra-001',
    codigo: 'ECG',
    nombre: 'Electrocardiograma',
    duracionTurnoEnMins: 45,
    costo: 6000,
  },
  electroencefalograma: {
    id: 'pra-002',
    codigo: 'EEG',
    nombre: 'Electroencefalograma',
    duracionTurnoEnMins: 60,
    costo: 9000,
  },
  controlPediatrico: {
    id: 'pra-003',
    codigo: 'PED-CTRL',
    nombre: 'Control pediatrico',
    duracionTurnoEnMins: 30,
    costo: 4500,
  },
};

const sedes = {
  central: {
    id: 'sede-001',
    nombre: 'Sede Central',
    direccion: 'Av. Siempre Viva 123',
  },
  norte: {
    id: 'sede-002',
    nombre: 'Sede Norte',
    direccion: 'Calle Falsa 456',
  },
  sur: {
    id: 'sede-003',
    nombre: 'Sede Sur',
    direccion: 'San Martin 789',
  },
};

const medicos = [
  {
    _id: 'med-001',
    matricula: 'MP-1234',
    nombre: 'Ana Gomez',
    especialidades: [especialidades.cardiologia, especialidades.clinicaMedica],
    practicas: [practicas.electrocardiograma],
    sedes: [sedes.central, sedes.norte],
    disponibilidades: [
      { diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00' },
      { diaSemana: 'MIERCOLES', horaDesde: '14:00', horaHasta: '18:00' },
      { diaSemana: 'VIERNES', horaDesde: '09:00', horaHasta: '13:00' },
    ],
  },
  {
    _id: 'med-002',
    matricula: 'MP-5678',
    nombre: 'Carlos Perez',
    especialidades: [especialidades.neurologia],
    practicas: [practicas.electroencefalograma],
    sedes: [sedes.norte],
    disponibilidades: [
      { diaSemana: 'MARTES', horaDesde: '07:00', horaHasta: '11:00' },
      { diaSemana: 'JUEVES', horaDesde: '15:00', horaHasta: '19:00' },
      { diaSemana: 'SABADO', horaDesde: '08:00', horaHasta: '12:00' },
    ],
  },
  {
    _id: 'med-003',
    matricula: 'MP-9012',
    nombre: 'Laura Martinez',
    especialidades: [especialidades.pediatria],
    practicas: [practicas.controlPediatrico],
    sedes: [sedes.sur],
    disponibilidades: [
      { diaSemana: 'LUNES', horaDesde: '10:00', horaHasta: '14:00' },
      { diaSemana: 'MIERCOLES', horaDesde: '16:00', horaHasta: '20:00' },
      { diaSemana: 'VIERNES', horaDesde: '08:30', horaHasta: '12:30' },
    ],
  },
];

const obrasSociales = [
  {
    _id: 'os-001',
    nombre: 'OSDE',
    planes: [
      {
        id: 'plan-210',
        nombre: '210',
        coberturasEspecialidad: [
          { especialidad: especialidades.cardiologia, nivel: 'PARCIAL' },
          { especialidad: especialidades.clinicaMedica, nivel: 'TOTAL' },
          { especialidad: especialidades.neurologia, nivel: 'NO_CUBIERTA' },
        ],
        coberturasPractica: [
          { practica: practicas.electrocardiograma, nivel: 'PARCIAL' },
        ],
      },
    ],
  },
  {
    _id: 'os-002',
    nombre: 'Swiss Medical',
    planes: [
      {
        id: 'plan-smg20',
        nombre: 'SMG20',
        coberturasEspecialidad: [
          { especialidad: especialidades.cardiologia, nivel: 'TOTAL' },
          { especialidad: especialidades.neurologia, nivel: 'PARCIAL' },
        ],
        coberturasPractica: [
          { practica: practicas.electrocardiograma, nivel: 'TOTAL' },
        ],
      },
    ],
  },
];

const pacientes = [
  {
    _id: 'pac-001',
    usuario: { id: 'usr-001', email: 'juan@example.com' },
    dni: '30111222',
    nombre: 'Juan Lopez',
    obraSocial: 'os-001',
    plan: 'plan-210',
    activo: true,
  },
  {
    _id: 'pac-002',
    usuario: { id: 'usr-002', email: 'maria@example.com' },
    dni: '32999888',
    nombre: 'Maria Fernandez',
    obraSocial: 'os-002',
    plan: 'plan-smg20',
    activo: true,
  },
  {
    _id: 'pac-003',
    usuario: { id: 'usr-003', email: 'pedro@example.com' },
    dni: '28777666',
    nombre: 'Pedro Ramirez',
    obraSocial: null,
    plan: null,
    activo: true,
  },
];

function upsertAll(model, documentos) {
  return model.bulkWrite(documentos.map(documento => ({
    updateOne: {
      filter: { _id: documento._id },
      update: { $set: documento },
      upsert: true,
    },
  })));
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('Falta configurar MONGO_URI en .env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [resultadoMedicos, resultadoObrasSociales, resultadoPacientes] = await Promise.all([
    upsertAll(medicoModel, medicos),
    upsertAll(obraSocialModel, obrasSociales),
    upsertAll(pacienteModel, pacientes),
  ]);

  console.log(JSON.stringify({
    medicos: resultadoMedicos.upsertedCount + resultadoMedicos.modifiedCount,
    obrasSociales: resultadoObrasSociales.upsertedCount + resultadoObrasSociales.modifiedCount,
    pacientes: resultadoPacientes.upsertedCount + resultadoPacientes.modifiedCount,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async error => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
