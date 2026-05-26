import { describe, test, expect, beforeEach } from '@jest/globals';
import { TurnoService } from '../../src/modules/turnos/service/TurnoService.js';
import { Turno } from '../../src/modules/turnos/domain/Turno.js';
import { EstadoTurno } from '../../src/modules/turnos/domain/EstadoTurno.js';
import { Medico } from '../../src/modules/medicos/domain/Medico.js';
import { Especialidad } from '../../src/modules/medicos/domain/Especialidad.js';
import { Practica } from '../../src/modules/medicos/domain/Practica.js';
import { DisponibilidadHoraria } from '../../src/modules/medicos/domain/DisponibilidadHoraria.js';
import { Sede } from '../../src/modules/medicos/domain/Sede.js';

// --- Mocks de repositorios (sync — await sobre valor no-Promise devuelve el valor) ---
function buildMockTurnoRepository() {
    const turnos = [];
    return {
        get turnos() { return turnos; },
        findAll:         ()     => [...turnos],
        findById:        (id)   => turnos.find(t => t.id === id) ?? null,
        findByMedicoId:  (id)   => turnos.filter(t => t.medico.id === id),
        findByPacienteId:(id)   => turnos.filter(t => t.paciente?.id === id),
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
        findById: (id) => medicosDB[id] ?? null,
        findAll:  ()   => Object.values(medicosDB),
        save:     (medico) => { medicosDB[medico.id] = medico; return medico; },
        updateById: (id, data) => {
            if (!medicosDB[id]) return null;
            Object.assign(medicosDB[id], data);
            return medicosDB[id];
        },
    };
}

function buildMockMedicos() {
    const cardiologia   = Especialidad.create({ id: 'esp-001', nombre: 'Cardiología',    duracionTurnoEnMins: 30, costoConsulta: 5000 });
    const clinicaMedica = Especialidad.create({ id: 'esp-004', nombre: 'Clínica Médica', duracionTurnoEnMins: 30, costoConsulta: 3500 });
    const electrocardiograma = Practica.create({ id: 'pra-001', codigo: 'ECG', nombre: 'Electrocardiograma', duracionTurnoEnMins: 45, costo: 6000 });
    const sedeCentral = Sede.create({ id: 'sede-001', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 123' });
    const sedeNorte   = Sede.create({ id: 'sede-002', nombre: 'Sede Norte',   direccion: 'Calle Falsa 456' });

    const med1 = Medico.create({
        id: 'med-001', matricula: 'MP-1234', nombre: 'Ana Gómez',
        especialidades: [cardiologia, clinicaMedica],
        practicas: [electrocardiograma],
        sedes: [sedeCentral, sedeNorte],
    });
    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'LUNES',     horaDesde: '08:00', horaHasta: '12:00' }));
    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'MIERCOLES', horaDesde: '14:00', horaHasta: '18:00' }));
    med1.definirDisponibilidad(DisponibilidadHoraria.create({ diaSemana: 'VIERNES',   horaDesde: '09:00', horaHasta: '13:00' }));

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
describe('TurnoService', () => {
    let turnoRepo;
    let medicoRepo;
    let turnoService;
    let medicosDB;
    let medico;
    let especialidad;
    let paciente;
    let sede;

    beforeEach(() => {
        medicosDB = buildMockMedicos();
        turnoRepo  = buildMockTurnoRepository();
        medicoRepo = buildMockMedicoRepository(medicosDB);
        turnoService = new TurnoService(turnoRepo, medicoRepo);

        medico      = medicosDB['med-001'];
        especialidad = medico.especialidades[0];
        paciente    = { id: 'pac-001', nombre: 'Juan López', dni: '30111222' };
        sede        = { id: 'sede-001', nombre: 'Sede Central', direccion: 'Av. Siempre Viva 123' };
    });

    function crearDatosTurno(overrides = {}) {
        return {
            id:           overrides.id ?? 'tur-001',
            medico:       overrides.medico ?? medico,
            paciente:     Object.prototype.hasOwnProperty.call(overrides, 'paciente') ? overrides.paciente : paciente,
            fechaHora:    overrides.fechaHora ?? proximaFechaParaDiaYHora('LUNES', '08:40'),
            sede:         Object.prototype.hasOwnProperty.call(overrides, 'sede') ? overrides.sede : sede,
            especialidad: overrides.especialidad ?? especialidad,
            practica:     overrides.practica ?? null,
            estado:       overrides.estado ?? EstadoTurno.CONFIRMADO,
            historialEstados: overrides.historialEstados ?? [],
            costo:        overrides.costo ?? especialidad.costoConsulta,
        };
    }

    function crearTurno(overrides = {}) {
        return Turno.create(crearDatosTurno(overrides));
    }

    test('debería listar todos los turnos guardados', async () => {
        const turno1 = crearTurno({ id: 'tur-001' });
        const turno2 = crearTurno({ id: 'tur-002', fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20') });

        turnoRepo.save(turno1);
        turnoRepo.save(turno2);

        const turnos = await turnoService.findAll();
        expect(turnos).toHaveLength(2);
    });

    test('debería buscar un turno existente por id', async () => {
        const turno = crearTurno({ id: 'tur-001' });
        turnoRepo.save(turno);

        const resultado = await turnoService.findById('tur-001');
        expect(resultado).toEqual(turno);
    });

    test('debería lanzar error si el turno no existe', async () => {
        await expect(turnoService.findById('tur-inexistente'))
            .rejects.toThrow("Turno con id 'tur-inexistente' no encontrado");
    });

    test('debería crear un turno válido cuando el médico tiene disponibilidad', async () => {
        const datosTurno = crearDatosTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') });

        const resultado = await turnoService.crearTurno(datosTurno);

        expect(resultado.id).toBe('tur-001');
        expect(resultado.medico.id).toBe('med-001');
        expect(resultado.paciente).toEqual(paciente);
        expect(resultado.sede).toEqual(sede);
        expect(resultado.especialidad).toEqual(especialidad);
        expect(resultado.estado).toBe(EstadoTurno.CONFIRMADO);
        expect(resultado.costo).toBe(especialidad.costoConsulta);
        expect(await turnoService.findAll()).toHaveLength(1);
    });

    test('debería crear un turno disponible sin paciente ni sede', async () => {
        const resultado = await turnoService.crearTurno(crearDatosTurno({
            id: 'tur-001', paciente: null, sede: null,
            estado: EstadoTurno.DISPONIBLE,
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:00'),
        }));

        expect(resultado.paciente).toBeNull();
        expect(resultado.sede).toBeNull();
        expect(resultado.estado).toBe(EstadoTurno.DISPONIBLE);
    });

    test('debería rechazar un turno fuera de la disponibilidad del médico', async () => {
        await expect(turnoService.crearTurno(crearDatosTurno({
            fechaHora: proximaFechaParaDiaYHora('MARTES', '08:30'),
        }))).rejects.toThrow('El médico no tiene disponibilidad para la fecha y horario solicitados');
    });

    test('debería rechazar un turno superpuesto con otro turno del mismo médico', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') }));

        await expect(turnoService.crearTurno(crearDatosTurno({
            id: 'tur-002', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:45'),
        }))).rejects.toThrow('El médico no tiene disponibilidad para la fecha y horario solicitados');
    });

    test('debería consultar disponibilidad y reportar turnos cercanos', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:00') }));

        const resultado = await turnoService.consultarDisponibilidad({
            medicoId: 'med-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '08:20').toISOString(),
            especialidadId: 'esp-001',
        });

        expect(resultado.disponible).toBe(false);
        expect(resultado.turnosCercanos).toHaveLength(1);
        expect(resultado.turnosCercanos[0].id).toBe('tur-001');
        expect(resultado.turnosCercanos[0].seSuperpone).toBe(true);
    });

    test('debería solicitar un turno y devolver la evaluación de disponibilidad', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-cercano-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:00') }));

        const resultado = await turnoService.solicitarTurno(crearDatosTurno({
            id: 'tur-002', fechaHora: proximaFechaParaDiaYHora('LUNES', '09:00'),
        }));

        expect(resultado.turno.id).toBe('tur-002');
        expect(resultado.disponibilidad.disponible).toBe(true);
        expect(resultado.disponibilidad.turnosCercanos).toHaveLength(1);
    });

    test('debería rechazar una solicitud que no inicia en módulo de 20 minutos', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-cercano-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') }));

        try {
            await turnoService.solicitarTurno(crearDatosTurno({
                id: 'tur-002', fechaHora: proximaFechaParaDiaYHora('LUNES', '09:15'),
            }));
            throw new Error('Se esperaba que la solicitud falle');
        } catch (error) {
            expect(error.message).toBe('El médico no tiene disponibilidad para la fecha y horario solicitados');
            expect(error.details.disponible).toBe(false);
            expect(error.details.turnosCercanos).toHaveLength(1);
        }
    });

    test('debería generar turnos disponibles usando la disponibilidad del médico', async () => {
        medicosDB['med-001'].disponibilidades = [
            DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '10:00' }),
        ];

        const turnos = await turnoService.generarTurnosDisponibles({ medicoId: 'med-001', especialidadId: 'esp-001' });

        expect(turnos.map(t => t.inicioTurno())).toEqual([540, 540, 560, 560]);
        expect(turnos.every(t => t.duracionTurno === 40)).toBe(true);
    });

    test('debería filtrar turnos disponibles por sede', async () => {
        medicosDB['med-001'].disponibilidades = [
            DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '10:00' }),
        ];

        const turnos = await turnoService.generarTurnosDisponibles({
            medicoId: 'med-001', especialidadId: 'esp-001', sedeId: 'sede-001',
        });

        expect(turnos.map(t => t.inicioTurno())).toEqual([540, 560]);
        expect(turnos.every(t => t.sede.id === 'sede-001')).toBe(true);
    });

    test('debería filtrar turnos disponibles por rango de fechas', async () => {
        medicosDB['med-001'].disponibilidades = [
            DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '10:00' }),
        ];

        const fechaDesde = proximaFechaParaDiaYHora('LUNES', '00:00');
        const fechaHasta = proximaFechaParaDiaYHora('LUNES', '23:59');

        const turnos = await turnoService.generarTurnosDisponibles({
            medicoId: 'med-001', especialidadId: 'esp-001', sedeId: 'sede-001',
            fechaDesde: fechaDesde.toISOString(), fechaHasta: fechaHasta.toISOString(),
        });

        expect(turnos.map(t => t.inicioTurno())).toEqual([540, 560]);
        expect(turnos.every(t => t.diaTurno() === 1)).toBe(true);
    });

    test('debería consultar disponibilidad para una práctica del médico', async () => {
        const resultado = await turnoService.consultarDisponibilidad({
            medicoId: 'med-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20').toISOString(),
            tipoPrestacion: 'practica',
            practicaId: 'pra-001',
        });

        expect(resultado.disponible).toBe(true);
        expect(resultado.duracionPrestacion).toBe(45);
        expect(resultado.modulosRequeridos).toBe(3);
        expect(resultado.duracionTurno).toBe(60);
    });

    test('debería rechazar disponibilidad para una práctica que el médico no realiza', async () => {
        await expect(turnoService.consultarDisponibilidad({
            medicoId: 'med-001',
            fechaHora: proximaFechaParaDiaYHora('LUNES', '09:20').toISOString(),
            tipoPrestacion: 'practica',
            practicaId: 'pra-002',
        })).rejects.toThrow("El médico no realiza la práctica 'pra-002'");
    });

    test('modificar la disponibilidad no debería cambiar turnos existentes', async () => {
        const fechaPasada = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const turnoExistente = crearTurno({ id: 'tur-001', fechaHora: fechaPasada });
        turnoRepo.save(turnoExistente);

        const fechaOriginal = new Date(turnoExistente.fechaHora);
        const disponibilidadesOriginales = [...turnoExistente.medico.disponibilidades];

        medicosDB['med-001'].disponibilidades = [
            DisponibilidadHoraria.create({ diaSemana: 'LUNES', horaDesde: '09:00', horaHasta: '10:00' }),
        ];

        const turnoGuardado = await turnoService.findById('tur-001');
        expect(turnoGuardado.fechaHora).toEqual(fechaOriginal);
        expect(turnoGuardado.medico.disponibilidades).toEqual(disponibilidadesOriginales);
    });

    test('debería actualizar un turno existente', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') }));

        const nuevaFechaHora = proximaFechaParaDiaYHora('LUNES', '10:00');
        const nuevaSede = { id: 'sede-002', nombre: 'Sede Norte', direccion: 'Calle Falsa 456' };

        const resultado = await turnoService.actualizarTurno('tur-001', {
            fechaHora: nuevaFechaHora, sede: nuevaSede, costo: 6500,
        });

        expect(resultado.id).toBe('tur-001');
        expect(resultado.fechaHora).toEqual(nuevaFechaHora);
        expect(resultado.sede).toEqual(nuevaSede);
        expect(resultado.costo).toBe(6500);
    });

    test('debería rechazar la actualización de un turno inexistente', async () => {
        await expect(turnoService.actualizarTurno('tur-inexistente', { costo: 6500 }))
            .rejects.toThrow("Turno con id 'tur-inexistente' no encontrado");
    });

    test('debería rechazar la actualización con fecha inválida', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001' }));
        await expect(turnoService.actualizarTurno('tur-001', { fechaHora: 'fecha-invalida' }))
            .rejects.toThrow('La fecha y hora del turno no es válida');
    });

    test('debería rechazar la actualización con costo negativo', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001' }));
        await expect(turnoService.actualizarTurno('tur-001', { costo: -100 }))
            .rejects.toThrow('El costo debe ser un número mayor o igual a cero');
    });

    test('debería dar de baja un turno existente', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') }));

        const usuario = { id: 'usr-001', nombre: 'Recepcionista' };
        const resultado = await turnoService.darDeBajaTurno('tur-001', usuario, 'El paciente canceló el turno');

        expect(resultado.estado).toBe(EstadoTurno.CANCELADO);
        expect(resultado.historialEstados).toHaveLength(1);
        expect(resultado.historialEstados[0].estado).toBe(EstadoTurno.CANCELADO);
        expect(resultado.historialEstados[0].usuario).toEqual(usuario);
        expect(resultado.historialEstados[0].motivo).toBe('El paciente canceló el turno');
    });

    test('debería marcar un turno como realizado', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') }));

        const resultado = await turnoService.marcarTurnoRealizado('tur-001', { id: 'med-001', nombre: 'Ana Gómez' });

        expect(resultado.estado).toBe(EstadoTurno.REALIZADO);
        expect(resultado.historialEstados[0].estado).toBe(EstadoTurno.REALIZADO);
    });

    test('debería rechazar la baja de un turno inexistente', async () => {
        await expect(turnoService.darDeBajaTurno('tur-inexistente', { id: 'usr-001', nombre: 'Recepcionista' }, 'Motivo'))
            .rejects.toThrow("Turno con id 'tur-inexistente' no encontrado");
    });

    test('debería rechazar la baja si falta menos de una hora para el turno', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: new Date(Date.now() + 30 * 60 * 1000) }));

        await expect(turnoService.darDeBajaTurno('tur-001', { id: 'usr-001', nombre: 'Recepcionista' }, 'Baja fuera de tiempo'))
            .rejects.toThrow('El turno solo puede darse de baja hasta una hora antes del horario del mismo');
    });

    test('debería eliminar un turno existente', async () => {
        turnoRepo.save(crearTurno({ id: 'tur-001', fechaHora: proximaFechaParaDiaYHora('LUNES', '08:40') }));

        await turnoService.eliminarTurno('tur-001');

        expect(await turnoService.findAll()).toHaveLength(0);
    });

    test('debería rechazar la eliminación de un turno inexistente', async () => {
        await expect(turnoService.eliminarTurno('tur-inexistente'))
            .rejects.toThrow("Turno con id 'tur-inexistente' no encontrado");
    });
});