import { MedicoService } from '../service/MedicoService.js';

function handleError(error, res) {
    const statusCode = error.statusCode ?? 500;

    res.status(statusCode).json({
        error: error.name ?? 'InternalServerError',
        message: error.message ?? 'Error interno del servidor',
    });
}

export const MedicoController = {
    listarDisponibilidades(req, res) {
        try {
            const { medicoId } = req.params;

            const disponibilidades = MedicoService.listarDisponibilidades(medicoId);

            res.status(200).json(disponibilidades);
        } catch (error) {
            handleError(error, res);
        }
    },

    agregarDisponibilidad(req, res) {
        try {
            const { medicoId } = req.params;

            const disponibilidad = MedicoService.agregarDisponibilidad(medicoId, req.body);

            res.status(201).json(disponibilidad);
        } catch (error) {
            handleError(error, res);
        }
    },

    actualizarDisponibilidad(req, res) {
        try {
            const { medicoId, diaSemana } = req.params;

            const disponibilidad = MedicoService.actualizarDisponibilidad(
                medicoId,
                diaSemana,
                req.body
            );

            res.status(200).json(disponibilidad);
        } catch (error) {
            handleError(error, res);
        }
    },

    eliminarDisponibilidad(req, res) {
        try {
            const { medicoId, diaSemana } = req.params;

            MedicoService.eliminarDisponibilidad(medicoId, diaSemana);

            res.status(204).send();
        } catch (error) {
            handleError(error, res);
        }
    },
};