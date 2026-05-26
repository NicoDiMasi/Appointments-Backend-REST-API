import { MedicoService } from '../service/MedicoService.js';


export const MedicoController = {
    async findAll(req, res, next) {
        try {
            const medicos = await MedicoService.findAll();
            res.status(200).json(medicos);
        } catch (error) {
            next(error);
        }
    },

    async findById(req, res, next) {
        try {
            const medico = await MedicoService.findById(req.params.medicoId);
            res.status(200).json(medico);
        } catch (error) {
            next(error);
        }
    },

    async create(req, res, next) {
        try {
            const medico = await MedicoService.crearMedico(req.body);
            res.status(201).json(medico);
        } catch (error) {
            next(error);
        }
    },

    async listarServicios(req, res, next) {
        try {
            const { medicoId } = req.params;
            const servicios = await MedicoService.listarServicios(medicoId);
            res.status(200).json(servicios);
        } catch (error) {
            next(error);
        }
    },

    async agregarServicio(req, res, next) {
        try {
            const { medicoId } = req.params;
            const servicio = await MedicoService.agregarServicio(medicoId, req.body);
            res.status(201).json(servicio);
        } catch (error) {
            next(error);
        }
    },

    async actualizarServicio(req, res, next) {
        try {
            const { medicoId, tipo, servicioId } = req.params;
            const servicio = await MedicoService.actualizarServicio(medicoId, tipo, servicioId, req.body);
            res.status(200).json(servicio);
        } catch (error) {
            next(error);
        }
    },

    async eliminarServicio(req, res, next) {
        try {
            const { medicoId, tipo, servicioId } = req.params;
            await MedicoService.eliminarServicio(medicoId, tipo, servicioId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    async listarDisponibilidades(req, res, next) {
        try {
            const { medicoId } = req.params;
            const disponibilidades = await MedicoService.listarDisponibilidades(medicoId);
            res.status(200).json(disponibilidades);
        } catch (error) {
            next(error);
        }
    },

    async agregarDisponibilidad(req, res, next) {
        try {
            const { medicoId } = req.params;
            const disponibilidad = await MedicoService.agregarDisponibilidad(medicoId, req.body);
            res.status(201).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },

    async actualizarDisponibilidad(req, res, next) {
        try {
            const { medicoId, diaSemana } = req.params;
            const disponibilidad = await MedicoService.actualizarDisponibilidad(medicoId, diaSemana, req.body);
            res.status(200).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },

    async eliminarDisponibilidad(req, res, next) {
        try {
            const { medicoId, diaSemana } = req.params;
            await MedicoService.eliminarDisponibilidad(medicoId, diaSemana);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },

    async consultarTurnosDePaciente(req, res, next) {
        try {
            const { medicoId, pacienteId } = req.params;
            const turnos = await MedicoService.consultarTurnosDePaciente(medicoId, pacienteId);
            res.status(200).json(turnos);
        } catch (error) {
            next(error);
        }
    },

    async actualizarTurno(req, res, next) {
        try {
            const { medicoId, turnoId } = req.params;
            const turno = await MedicoService.actualizarTurno(medicoId, turnoId, req.body);
            res.status(200).json(turno);
        } catch (error) {
            next(error);
        }
    },

    async consultarDisponibilidadTurno(req, res, next) {
        try {
            const { medicoId } = req.params;
            const disponibilidad = await MedicoService.consultarDisponibilidadTurno(medicoId, req.query);
            res.status(200).json(disponibilidad);
        } catch (error) {
            next(error);
        }
    },
};