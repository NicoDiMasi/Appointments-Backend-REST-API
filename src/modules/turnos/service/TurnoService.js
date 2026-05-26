import { Turno } from '../domain/Turno.js';
import { Agenda } from '../domain/Agenda.js';
import { EstadoTurno } from '../domain/EstadoTurno.js';
import { TurnoRepository } from '../repository/TurnoRepository.js';
import { medicoRepository } from '../../medicos/repository/MedicoRepository.js';
import { MedicoNotFoundError } from '../../medicos/errors/MedicoErrors.js';
import {
    calcularCantidadModulos,
    calcularDuracionModular,
} from '../domain/ModuloTurno.js';
import {
    TurnoNotFoundError,
    TurnoNoDisponibleError,
    TurnoBajaFueraDeTiempoError,
    TurnoInvalidoError,
} from '../errors/TurnoErrors.js';
import {
    formatearFechaHoraArgentina,
    mismaFechaArgentina,
    parsearFechaHoraArgentina,
} from '../../../utils/dateTime.js';
import { ObraSocialService } from '../../obrasSociales/service/ObraSocialService.js';
import { NivelCobertura } from '../../obrasSociales/domain/NivelCobertura.js';

function faltaMasDeUnaHora(fechaHoraTurno) {
    const ahora = new Date();
    const unaHoraEnMs = 60 * 60 * 1000;

    return fechaHoraTurno.getTime() - ahora.getTime() >= unaHoraEnMs;
}

export class TurnoService {

    constructor(
        turnoRepository,
        medicosRepository = medicoRepository,
        obraSocialService = ObraSocialService
    ) {
        this.turnoRepository = turnoRepository;
        this.medicoRepository = medicosRepository;
        this.obraSocialService = obraSocialService;
        this.agenda = new Agenda();
    }

    findAll() {
      return this.turnoRepository.findAll();
    }

    findById(turnoId) {
      const turno = this.turnoRepository.findById(turnoId);

      if (!turno) {
        throw new TurnoNotFoundError(turnoId);
      }

      return turno;
    }

    findByPacienteId(pacienteId) {
      return this.turnoRepository.findByPacienteId(pacienteId);
    }

    findByMedicoId(medicoId) {
      return this.turnoRepository.findByMedicoId(medicoId);
    }

    findByMedicoAndPacienteId(medicoId, pacienteId) {
      return this.turnoRepository
        .findByMedicoId(medicoId)
        .filter(turno => turno.paciente?.id === pacienteId);
    }

    crearTurno(datosTurno) {
        const { turnoNuevo, evaluacionDisponibilidad } = this.evaluarSolicitudTurno(datosTurno);

        if (!evaluacionDisponibilidad.disponible) {
            throw new TurnoNoDisponibleError(evaluacionDisponibilidad);
        }

        return this.turnoRepository.save(turnoNuevo);
    }

    reservarTurnoPaciente(paciente, datosTurno) {
        const medicoId = datosTurno.medico?.id ?? datosTurno.medicoId;
        const medico = this.medicoRepository.findById(medicoId);

        if (!medico) {
            throw new MedicoNotFoundError(medicoId);
        }

        const especialidad = datosTurno.especialidad ??
            medico.especialidades.find(e => e.id === datosTurno.especialidadId);

        if (!especialidad) {
            throw new TurnoInvalidoError(`El médico no atiende la especialidad '${datosTurno.especialidadId}'`);
        }

        return this.crearTurno({
            ...datosTurno,
            medico: { id: medico.id },
            paciente,
            fechaHora: parsearFechaHoraArgentina(datosTurno.fechaHora),
            especialidad,
            estado: EstadoTurno.RESERVADO,
            historialEstados: datosTurno.historialEstados ?? [],
            costo: datosTurno.costo ?? especialidad.costoConsulta,
        });
    }

    cancelarTurnoPaciente(paciente, turnoId, motivo) {
        this.validarMotivo(motivo);

        const turno = this.obtenerTurnoDelPaciente(turnoId, paciente.id);

        return this.darDeBajaTurno(
            turno.id,
            { id: paciente.id, nombre: paciente.nombre },
            motivo
        );
    }

    cancelarTurnoMedico(medico, turnoId, motivo) {
        this.validarMotivo(motivo);

        const turno = this.obtenerTurnoDelMedico(turnoId, medico.id);

        return this.darDeBajaTurno(
            turno.id,
            { id: medico.id, nombre: medico.nombre },
            motivo
        );
    }

    cambiarTurnoPaciente(paciente, turnoId, cambios) {
        const turno = this.obtenerTurnoDelPaciente(turnoId, paciente.id);

        if (!faltaMasDeUnaHora(turno.fechaHora)) {
            throw new TurnoBajaFueraDeTiempoError();
        }

        const medicoSolicitadoId = cambios.medico?.id ?? cambios.medicoId;

        if (medicoSolicitadoId && medicoSolicitadoId !== turno.medico.id) {
            throw new TurnoInvalidoError('El cambio de turno debe mantener el mismo profesional');
        }

        return this.actualizarTurno(turno.id, {
            ...cambios,
            fechaHora: parsearFechaHoraArgentina(cambios.fechaHora),
            medico: turno.medico,
        });
    }

    solicitarTurno(datosTurno) {
        const { turnoNuevo, evaluacionDisponibilidad } = this.evaluarSolicitudTurno(datosTurno);

        if (!evaluacionDisponibilidad.disponible) {
            throw new TurnoNoDisponibleError(evaluacionDisponibilidad);
        }

        const turno = this.turnoRepository.save(turnoNuevo);

        return {
            turno,
            disponibilidad: evaluacionDisponibilidad,
        };
    }

    evaluarSolicitudTurno(datosTurno, ventanaMinutos = datosTurno.ventanaMinutos ?? 60) {
        const medico = this.medicoRepository.findById(datosTurno.medico?.id);

        if (!medico) {
            throw new MedicoNotFoundError(datosTurno.medico?.id);
        }

        const turnoNuevo = Turno.create({
            ...datosTurno,
            medico,
        });

        const turnosDelMedico = this.turnoRepository.findByMedicoId(
            turnoNuevo.medico.id
        );
        const ventana = this.validarVentanaMinutos(ventanaMinutos);
        const disponible = this.agenda.estaDisponible(turnoNuevo, turnosDelMedico);
        const turnosCercanos = this.buscarTurnosCercanos(
            turnoNuevo,
            turnosDelMedico,
            ventana
        );

        return {
            turnoNuevo,
            evaluacionDisponibilidad: this.armarRespuestaDisponibilidad(
                turnoNuevo,
                disponible,
                turnosCercanos
            ),
        };
    }

    consultarDisponibilidad({ medicoId, fechaHora, duracionTurnoEnMins, especialidadId, practicaId, tipoPrestacion, ventanaMinutos = 60 }) {
        const medico = this.medicoRepository.findById(medicoId);

        if (!medico) {
            throw new MedicoNotFoundError(medicoId);
        }

        const fechaHoraSolicitada = parsearFechaHoraArgentina(fechaHora);

        if (Number.isNaN(fechaHoraSolicitada.getTime())) {
            throw new TurnoInvalidoError('La fecha y hora del turno no es válida');
        }

        const { prestacion, tipo, duracionPrestacion } = this.resolverPrestacion({
            medico,
            especialidadId,
            practicaId,
            tipoPrestacion,
            duracionTurnoEnMins,
        });

        const turnoSolicitado = Turno.create({
            id: 'turno-consultado',
            medico,
            paciente: null,
            fechaHora: fechaHoraSolicitada,
            sede: null,
            especialidad: tipo === 'especialidad' ? prestacion : null,
            practica: tipo === 'practica' ? prestacion : null,
            estado: EstadoTurno.DISPONIBLE,
            historialEstados: [],
            costo: 0,
        });

        const ventana = this.validarVentanaMinutos(ventanaMinutos);
        const turnosDelMedico = this.turnoRepository.findByMedicoId(medicoId);
        const disponible = this.agenda.estaDisponible(turnoSolicitado, turnosDelMedico);
        const turnosCercanos = this.buscarTurnosCercanos(
            turnoSolicitado,
            turnosDelMedico,
            ventana
        );

        return this.armarRespuestaDisponibilidad(
            turnoSolicitado,
            disponible,
            turnosCercanos,
            duracionPrestacion
        );
    }

    generarTurnosDisponibles({ medicoId, especialidadId, practicaId, tipoPrestacion, duracionTurnoEnMins, sedeId, fechaDesde, fechaHasta }) {
        return this.buscarTurnosDisponiblesParaPaciente({
            medicoId,
            especialidadId,
            practicaId,
            tipoPrestacion,
            duracionTurnoEnMins,
            sedeId,
            fechaDesde,
            fechaHasta,
        });
    }

    buscarTurnosDisponiblesParaPaciente({
                                            paciente,
                                            medicoId,
                                            especialidadId,
                                            practicaId,
                                            tipoPrestacion,
                                            duracionTurnoEnMins,
                                            sedeId,
                                            fechaDesde,
                                            fechaHasta,
                                            page = 1,
                                            limit = 20,
                                            sortBy = 'fecha',
                                            sortOrder = 'asc',
                                        }) {
        const medicos = this.obtenerMedicosParaBusqueda({
            medicoId,
            especialidadId,
            practicaId,
            tipoPrestacion,
        });

        const rangoFechas = this.resolverRangoFechas({ fechaDesde, fechaHasta });

        const turnos = medicos.flatMap(medico => {
            const { prestacion, tipo } = this.resolverPrestacion({
                medico,
                especialidadId,
                practicaId,
                tipoPrestacion,
                duracionTurnoEnMins,
            });

            const turnosDelMedico = this.turnosQueBloqueanAgenda(medico.id);

            const turnosGenerados = this.generarTurnosPorFiltroFecha({
                prestacion,
                tipo,
                medico,
                rangoFechas,
            });

            return turnosGenerados
                .filter(turno => this.agenda.estaDisponible(turno, turnosDelMedico))
                .filter(turno => this.cumpleFiltroSede(turno, sedeId))
                .filter(turno => this.cumpleFiltroRangoFecha(turno, rangoFechas))
                .map(turno => this.agregarCoberturaYMonto(turno, paciente, tipo));
        });

        return this.aplicarOrdenYPaginacion(turnos, {
            page,
            limit,
            sortBy,
            sortOrder,
        });
    }

    obtenerMedicosParaBusqueda({ medicoId, especialidadId, practicaId, tipoPrestacion }) {
        if (medicoId) {
            const medico = this.medicoRepository.findById(medicoId);

            if (!medico) {
                throw new MedicoNotFoundError(medicoId);
            }

            return [medico];
        }

        const consultaPractica = tipoPrestacion === 'practica' || Boolean(practicaId);

        if (consultaPractica) {
            return this.medicoRepository
                .findAll()
                .filter(medico => medico.practicas.some(practica => practica.id === practicaId));
        }

        return this.medicoRepository
            .findAll()
            .filter(medico => medico.especialidades.some(especialidad => especialidad.id === especialidadId));
    }

    generarTurnosPorFiltroFecha({ prestacion, tipo, medico, rangoFechas }) {
        if (rangoFechas) {
            return tipo === 'practica'
                ? this.agenda.generarTurnosParaPracticaEnRango(prestacion, medico, rangoFechas.fechaDesde, rangoFechas.fechaHasta)
                : this.agenda.generarTurnosParaEspecialidadEnRango(prestacion, medico, rangoFechas.fechaDesde, rangoFechas.fechaHasta);
        }

        return tipo === 'practica'
            ? this.agenda.generarTurnosParaPractica(prestacion, medico)
            : this.agenda.generarTurnosParaEspecialidad(prestacion, medico);
    }

    resolverRangoFechas({ fechaDesde, fechaHasta }) {
        if (!fechaDesde && !fechaHasta) {
            return null;
        }

        if (!fechaDesde || !fechaHasta) {
            throw new TurnoInvalidoError('fechaDesde y fechaHasta deben informarse juntas');
        }

        const fechaDesdeParseada = parsearFechaHoraArgentina(fechaDesde);
        const fechaHastaParseada = parsearFechaHoraArgentina(fechaHasta);

        if (Number.isNaN(fechaDesdeParseada.getTime()) || Number.isNaN(fechaHastaParseada.getTime())) {
            throw new TurnoInvalidoError('El rango de fechas no es valido');
        }

        if (fechaDesdeParseada.getTime() > fechaHastaParseada.getTime()) {
            throw new TurnoInvalidoError('fechaDesde debe ser anterior o igual a fechaHasta');
        }

        return {
            fechaDesde: fechaDesdeParseada,
            fechaHasta: fechaHastaParseada,
        };
    }

    cumpleFiltroSede(turno, sedeId) {
        return !sedeId || turno.sede?.id === sedeId;
    }

    cumpleFiltroRangoFecha(turno, rangoFechas) {
        if (!rangoFechas) {
            return true;
        }

        return (
            turno.fechaHora.getTime() >= rangoFechas.fechaDesde.getTime() &&
            turno.fechaHora.getTime() <= rangoFechas.fechaHasta.getTime()
        );
    }

    turnosQueBloqueanAgenda(medicoId) {
        return this.turnoRepository
            .findByMedicoId(medicoId)
            .filter(turno => turno.estado !== EstadoTurno.CANCELADO);
    }

    buscarTurnosCercanos(turnoSolicitado, turnosDelMedico, ventanaMinutos) {
        const ventanaEnMs = ventanaMinutos * 60 * 1000;
        const inicioSolicitado = turnoSolicitado.fechaHora.getTime();

        return turnosDelMedico
            .filter(turno => mismaFechaArgentina(turno.fechaHora, turnoSolicitado.fechaHora))
            .filter(turno => {
                const diferencia = Math.abs(turno.fechaHora.getTime() - inicioSolicitado);

                return diferencia <= ventanaEnMs || this.agenda.seSuperponen(turnoSolicitado, turno);
            })
            .map(turno => ({
                id: turno.id,
                estado: turno.estado,
                fechaHora: formatearFechaHoraArgentina(turno.fechaHora),
                duracionTurno: turno.duracionTurno,
                seSuperpone: this.agenda.seSuperponen(turnoSolicitado, turno),
            }));
    }

    validarVentanaMinutos(ventanaMinutos) {
        const ventana = Number(ventanaMinutos);

        if (!Number.isInteger(ventana) || ventana <= 0) {
            throw new TurnoInvalidoError('La ventana de búsqueda debe ser un entero positivo');
        }

        return ventana;
    }

    armarRespuestaDisponibilidad(turno, disponible, turnosCercanos, duracionPrestacion = null) {
        return {
            disponible,
            medicoId: turno.medico.id,
            fechaHora: formatearFechaHoraArgentina(turno.fechaHora),
            duracionPrestacion: duracionPrestacion ?? this.agenda.obtenerDuracionPrestacion(
                turno.especialidad ?? turno.practica
            ),
            duracionTurno: turno.duracionTurno,
            modulosRequeridos: turno.modulosRequeridos,
            turnosCercanos,
        };
    }

    obtenerTurnoDelPaciente(turnoId, pacienteId) {
        const turno = this.findById(turnoId);

        if (turno.paciente?.id !== pacienteId) {
            throw new TurnoInvalidoError('El turno no pertenece al paciente indicado');
        }

        return turno;
    }

    obtenerTurnoDelMedico(turnoId, medicoId) {
        const turno = this.findById(turnoId);

        if (turno.medico?.id !== medicoId) {
            throw new TurnoInvalidoError('El turno no pertenece al médico indicado');
        }

        return turno;
    }

    validarMotivo(motivo) {
        if (typeof motivo !== 'string' || motivo.trim() === '') {
            throw new TurnoInvalidoError('El motivo de cancelación es obligatorio');
        }
    }

    resolverPrestacion({ medico, especialidadId, practicaId, tipoPrestacion, duracionTurnoEnMins }) {
        const consultaPractica = tipoPrestacion === 'practica' || Boolean(practicaId);

        if (consultaPractica) {
            const practica = practicaId
                ? medico.practicas.find(p => p.id === practicaId)
                : null;

            if (practicaId && !practica) {
                throw new TurnoInvalidoError(`El médico no realiza la práctica '${practicaId}'`);
            }

            const duracionPrestacion = practica?.duracionTurnoEnMins ?? Number(duracionTurnoEnMins);

            if (!Number.isInteger(duracionPrestacion) || duracionPrestacion <= 0) {
                throw new TurnoInvalidoError('La duración de la práctica debe ser un entero positivo');
            }

            return {
                tipo: 'practica',
                prestacion: practica ?? {
                    id: 'practica-consultada',
                    codigo: 'PRA-CONSULTADA',
                    nombre: 'Práctica consultada',
                    duracionTurnoEnMins: duracionPrestacion,
                    costo: 0,
                },
                duracionPrestacion,
            };
        }

        const especialidad = especialidadId
            ? medico.especialidades.find(e => e.id === especialidadId)
            : null;

        if (especialidadId && !especialidad) {
            throw new TurnoInvalidoError(`El médico no atiende la especialidad '${especialidadId}'`);
        }

        const duracionPrestacion = especialidad?.duracionTurnoEnMins ?? Number(duracionTurnoEnMins);

        if (!Number.isInteger(duracionPrestacion) || duracionPrestacion <= 0) {
            throw new TurnoInvalidoError('La duración del turno debe ser un entero positivo');
        }

        return {
            tipo: 'especialidad',
            prestacion: especialidad ?? {
                id: 'prestacion-consultada',
                nombre: 'Prestación consultada',
                duracionTurnoEnMins: duracionPrestacion,
            },
            duracionPrestacion,
        };
    }

    marcarTurnoRealizado(turnoId, usuario = { id: 'sistema', nombre: 'Sistema' }) {
        const turno = this.findById(turnoId);

        turno.actualizarEstado(
            EstadoTurno.REALIZADO,
            usuario,
            'Turno realizado'
        );

        return this.turnoRepository.save(turno);
    }

    actualizarTurno(turnoId, cambios) {
        const turno = this.turnoRepository.findById(turnoId);

        if (!turno) throw new TurnoNotFoundError(turnoId);

        if (cambios.fechaHora !== undefined) {
            const nuevaFechaHora = parsearFechaHoraArgentina(cambios.fechaHora);

            if (Number.isNaN(nuevaFechaHora.getTime())) {
                throw new TurnoInvalidoError('La fecha y hora del turno no es válida');
            }

            const medicoActual = this.medicoRepository.findById(turno.medico.id) ?? turno.medico;
            const turnoActualizadoTemporal = Turno.create({
                id: turno.id,
                medico: medicoActual,
                paciente: turno.paciente,
                fechaHora: nuevaFechaHora,
                sede: cambios.sede ?? turno.sede,
                especialidad: cambios.especialidad ?? turno.especialidad,
                practica: cambios.practica ?? turno.practica,
                estado: turno.estado,
                historialEstados: turno.historialEstados,
                costo: cambios.costo ?? turno.costo,
            });

            const turnosDelMedico = this.turnoRepository
                .findByMedicoId(turno.medico.id)
                .filter(t => t.id !== turno.id);

            const estaDisponible = this.agenda.estaDisponible(turnoActualizadoTemporal, turnosDelMedico);

            if (!estaDisponible) {
                throw new TurnoNoDisponibleError(
                    this.armarRespuestaDisponibilidad(
                        turnoActualizadoTemporal,
                        estaDisponible,
                        this.buscarTurnosCercanos(turnoActualizadoTemporal, turnosDelMedico, 60)
                    )
                );
            }

            turno.fechaHora = nuevaFechaHora;
        }

        if (cambios.sede !== undefined) {
            turno.sede = cambios.sede;
        }

        if (cambios.especialidad !== undefined) {
            turno.especialidad = cambios.especialidad;
            turno.modulosRequeridos = calcularCantidadModulos(cambios.especialidad.duracionTurnoEnMins);
            turno.duracionTurno = calcularDuracionModular(cambios.especialidad.duracionTurnoEnMins);
        }

        if (cambios.costo !== undefined) {
            if (typeof cambios.costo !== 'number' || cambios.costo < 0) {
                throw new TurnoInvalidoError('El costo debe ser un número mayor o igual a cero');
            }

            turno.costo = cambios.costo;
        }

        return this.turnoRepository.save(turno);
    }

    darDeBajaTurno(turnoId, usuario, motivo) {
        const turno = this.turnoRepository.findById(turnoId);

        if (!turno) {
            throw new TurnoNotFoundError(turnoId);
        }

        if (!faltaMasDeUnaHora(turno.fechaHora)) {
            throw new TurnoBajaFueraDeTiempoError();
        }

        turno.actualizarEstado(
            EstadoTurno.CANCELADO,
            usuario,
            motivo
        );

        return this.turnoRepository.save(turno);
    }

    eliminarTurno(turnoId) {
        const turno = this.turnoRepository.findById(turnoId);

        if (!turno) {
            throw new TurnoNotFoundError(turnoId);
        }

        if (!faltaMasDeUnaHora(turno.fechaHora)) {
            throw new TurnoBajaFueraDeTiempoError();
        }

        this.turnoRepository.deleteById(turnoId);
    }

    agregarCoberturaYMonto(turno, paciente, tipoPrestacion) {
        const prestacion = tipoPrestacion === 'practica'
            ? turno.practica
            : turno.especialidad;

        const costoBase = turno.costo ?? prestacion.costoConsulta ?? prestacion.costo ?? 0;
        const cobertura = this.obtenerNivelCobertura(paciente, prestacion, tipoPrestacion);
        const montoAbonar = this.calcularMontoAbonar(costoBase, cobertura);

        return {
            ...turno,
            cobertura,
            costoBase,
            montoAbonar,
        };
    }

    obtenerNivelCobertura(paciente, prestacion, tipoPrestacion) {
        const obraSocialId = this.obtenerId(paciente?.obraSocial);
        const planId = this.obtenerId(paciente?.plan);

        if (!obraSocialId || !planId) {
            return NivelCobertura.NO_CUBIERTA;
        }

        const plan = this.obraSocialService.buscarPlan(obraSocialId, planId);

        const coberturas = tipoPrestacion === 'practica'
            ? plan.coberturasPractica
            : plan.coberturasEspecialidad;

        const cobertura = coberturas.find(cobertura =>
            tipoPrestacion === 'practica'
                ? cobertura.practica.id === prestacion.id
                : cobertura.especialidad.id === prestacion.id
        );

        return cobertura?.nivel ?? NivelCobertura.NO_CUBIERTA;
    }

    calcularMontoAbonar(costoBase, cobertura) {
        if (cobertura === NivelCobertura.TOTAL) {
            return 0;
        }

        if (cobertura === NivelCobertura.PARCIAL) {
            return costoBase * 0.5;
        }

        return costoBase;
    }

    obtenerId(valor) {
        if (!valor) {
            return null;
        }

        if (typeof valor === 'string') {
            return valor;
        }

        return valor.id ?? valor._id ?? null;
    }

    aplicarOrdenYPaginacion(turnos, { page, limit, sortBy, sortOrder }) {
        const pagina = Number(page);
        const cantidad = Number(limit);
        const direccion = sortOrder === 'desc' ? -1 : 1;

        const ordenados = [...turnos].sort((turnoA, turnoB) => {
            if (sortBy === 'costo') {
                return (turnoA.montoAbonar - turnoB.montoAbonar) * direccion;
            }

            return (turnoA.fechaHora.getTime() - turnoB.fechaHora.getTime()) * direccion;
        });

        const inicio = (pagina - 1) * cantidad;

        return {
            page: pagina,
            limit: cantidad,
            total: turnos.length,
            items: ordenados.slice(inicio, inicio + cantidad),
        };
    }
}