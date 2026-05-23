import { Turno } from './Turno.js';
import { EstadoTurno } from './EstadoTurno.js';
import {
  DURACION_MODULO_EN_MINUTOS,
  calcularCantidadModulos,
} from './ModuloTurno.js';

export class Agenda {

  generarTurnosParaEspecialidad(especialidad, medico) {
    return this.generarTurnosPara(especialidad, medico, 'especialidad');
  }

  generarTurnosParaPractica(practica, medico) {
    return this.generarTurnosPara(practica, medico, 'practica');
  }
  
  generarTurnosPara(prestacion, medico, tipoPrestacion) {
    const turnosGenerados = [];
    const cantidadModulos = calcularCantidadModulos(this.obtenerDuracionPrestacion(prestacion));

    medico.disponibilidades.forEach((disponibilidad) => {
      const fechaDisponibilidad = this.obtenerProximaFechaParaDia(
        disponibilidad.diaSemana
      );

      let inicioTurno = this.obtenerMinutosDelDia(disponibilidad.horaDesde);
      const finDisponibilidad = this.obtenerMinutosDelDia(disponibilidad.horaHasta);

      while (inicioTurno + DURACION_MODULO_EN_MINUTOS <= finDisponibilidad) {
        const fechaHoraTurno = this.crearFechaConMinutos(
          fechaDisponibilidad,
          inicioTurno
        );

        const turnoDisponible = Turno.create({
          id: crypto.randomUUID(),
          medico,
          paciente: null,
          fechaHora: fechaHoraTurno,
          sede: null,
          especialidad: tipoPrestacion === 'especialidad' ? prestacion : null,
          practica: tipoPrestacion === 'practica' ? prestacion : null,
          estado: EstadoTurno.DISPONIBLE,
          historialEstados: [],
          costo: prestacion.costoConsulta,
          duracionTurno: DURACION_MODULO_EN_MINUTOS,
          modulosRequeridos: cantidadModulos,
        });

        turnosGenerados.push(turnoDisponible);

        inicioTurno += DURACION_MODULO_EN_MINUTOS;
      }
    });

    return turnosGenerados;
  }

  obtenerDuracionPrestacion(prestacion) {
    return prestacion.duracionTurnoEnMins ?? prestacion.duracionEnMins;
  }

  refrescarTurnosSegunDisponibilidadDe(medico) {
    return [];
  }


  obtenerMinutosDelDia(valor) {
    if (valor instanceof Date) {
      return valor.getHours() * 60 + valor.getMinutes();
    }

    if (typeof valor === 'string') {
      const [horas, minutos] = valor.split(':').map(Number);
      return horas * 60 + minutos;
    }

    throw new Error('Formato de hora inválido');
  }

  obtenerProximaFechaParaDia(diaSemana) {
    const dias = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    const fecha = new Date();
    const diaObjetivo = dias[diaSemana];

    const diferenciaDias = (diaObjetivo - fecha.getDay() + 7) % 7 || 7;

    fecha.setDate(fecha.getDate() + diferenciaDias);
    fecha.setHours(0, 0, 0, 0);

    return fecha;
  }

  crearFechaConMinutos(fechaBase, minutosDelDia) {
    const fecha = new Date(fechaBase);
    const horas = Math.floor(minutosDelDia / 60);
    const minutos = minutosDelDia % 60;

    fecha.setHours(horas, minutos, 0, 0);

    return fecha;
  }

  estaDisponible(turno, turnosDelMedico = []) {
    return (
      this.validarDiaYHorario(turno, turno.medico.disponibilidades) &&
      !turnosDelMedico.some((turnoOcupado) => {
        return this.seSuperponen(turno, turnoOcupado);
      })
    );
  }

  validarDiaYHorario(turno, disponibilidades) {
    return disponibilidades.some((disponibilidadHoraria) => {
      const inicioDisponibilidad = this.obtenerMinutosDelDia(disponibilidadHoraria.horaDesde);

      const finDisponibilidad = this.obtenerMinutosDelDia(disponibilidadHoraria.horaHasta);

      return (
        this.obtenerNumeroDiaSemana(disponibilidadHoraria.diaSemana) === turno.diaTurno() &&
        turno.inicioTurno() >= inicioDisponibilidad &&
        turno.finTurno() <= finDisponibilidad &&
        this.iniciaEnModulo(turno.inicioTurno(), inicioDisponibilidad)
      );
    });
  }

  iniciaEnModulo(inicioTurno, inicioDisponibilidad) {
    return (inicioTurno - inicioDisponibilidad) % DURACION_MODULO_EN_MINUTOS === 0;
  }

  seSuperponen(turnoA, turnoB) {
    const mismaFecha =
      turnoA.fechaHora.toDateString() === turnoB.fechaHora.toDateString();
    
    return (
      mismaFecha &&
      turnoA.inicioTurno() < turnoB.finTurno() &&
      turnoA.finTurno() > turnoB.inicioTurno()
    );
  }

  obtenerNumeroDiaSemana(diaSemana) {
    const dias = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    return dias[diaSemana];
  }

}
