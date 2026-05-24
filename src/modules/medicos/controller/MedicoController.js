import { MedicoService } from '../service/MedicoService.js';


export const MedicoController = {
    listarServicios(req, res, next) {
        try {
            const { medicoId } = req.params;

            const servicios = MedicoService.listarServicios(medicoId);

            res.status(200).json(servicios);
        } catch (error) {
            next(error);
        }
    },

    agregarServicio(req, res, next) {
        try {
            const { medicoId } = req.params;

            const servicio = MedicoService.agregarServicio(medicoId, req.body);

            res.status(201).json(servicio);
        } catch (error) {
            next(error);
        }
    },

    actualizarServicio(req, res, next) {
        try {
            const { medicoId, tipo, servicioId } = req.params;

            const servicio = MedicoService.actualizarServicio(
                medicoId,
                tipo,
                servicioId,
                req.body
            );

            res.status(200).json(servicio);
        } catch (error) {
            next(error);
        }
    },

    eliminarServicio(req, res, next) {
        try {
            const { medicoId, tipo, servicioId } = req.params;

            MedicoService.eliminarServicio(medicoId, tipo, servicioId);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    listarDisponibilidades(req, res, next) {
        try {
            const { medicoId } = req.params;

            const disponibilidades = MedicoService.listarDisponibilidades(medicoId);

            res.status(200).json(disponibilidades);
        } catch (error) {
            next(error);
        }
    },

    agregarDisponibilidad(req, res, next) {
        try {
            const { medicoId } = req.params;

            const disponibilidad = MedicoService.agregarDisponibilidad(medicoId, req.body);

            res.status(201).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },

    actualizarDisponibilidad(req, res, next) {
        try {
            const { medicoId, diaSemana } = req.params;

            const disponibilidad = MedicoService.actualizarDisponibilidad(
                medicoId,
                diaSemana,
                req.body
            );

            res.status(200).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },

    eliminarDisponibilidad(req, res, next) {
        try {
            const { medicoId, diaSemana } = req.params;

            MedicoService.eliminarDisponibilidad(medicoId, diaSemana);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    consultarTurnosDePaciente(req, res, next) {
        try {
            const { medicoId, pacienteId } = req.params;

            const turnos = MedicoService.consultarTurnosDePaciente(medicoId, pacienteId);

            res.status(200).json(turnos);
        } catch (error) {
            next(error);
        }
    },

    actualizarTurno(req, res, next) {
        try {
            const { medicoId, turnoId } = req.params;

            const turno = MedicoService.actualizarTurno(medicoId, turnoId, req.body);

            res.status(200).json(turno);
        } catch (error) {
            next(error);
        }
    },

    consultarDisponibilidadTurno(req, res, next) {
        try {
            const { medicoId } = req.params;

            const disponibilidad = MedicoService.consultarDisponibilidadTurno(
                medicoId,
                req.query
            );

            res.status(200).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },
};
