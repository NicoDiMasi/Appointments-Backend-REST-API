import { Turno } from './Turno.js';
import { EstadoTurno } from './EstadoTurno.js';
import {
  DURACION_MODULO_EN_MINUTOS,
  calcularCantidadModulos,
} from './ModuloTurno.js';
import {
  crearFechaHoraArgentina,
  mismaFechaArgentina,
  obtenerMinutosDelDiaArgentina,
  obtenerPartesFechaArgentina,
} from '../../../utils/dateTime.js';

export class Agenda {

  generarTurnosParaEspecialidad(especialidad, medico) {
    return this.generarTurnosPara(especialidad, medico, 'especialidad');
  }

  generarTurnosParaPractica(practica, medico) {
    return this.generarTurnosPara(practica, medico, 'practica');
  }

  generarTurnosParaEspecialidadEnRango(especialidad, medico, fechaDesde, fechaHasta) {
    return this.generarTurnosParaEnRango(especialidad, medico, 'especialidad', fechaDesde, fechaHasta);
  }

  generarTurnosParaPracticaEnRango(practica, medico, fechaDesde, fechaHasta) {
    return this.generarTurnosParaEnRango(practica, medico, 'practica', fechaDesde, fechaHasta);
  }
  
  generarTurnosPara(prestacion, medico, tipoPrestacion) {
    const turnosGenerados = [];
    const cantidadModulos = calcularCantidadModulos(this.obtenerDuracionPrestacion(prestacion));
    const duracionTurno = cantidadModulos * DURACION_MODULO_EN_MINUTOS;
    const sedes = medico.sedes?.length ? medico.sedes : [null];

    medico.disponibilidades.forEach((disponibilidad) => {
      const fechaDisponibilidad = this.obtenerProximaFechaParaDia(
        disponibilidad.diaSemana
      );

      let inicioTurno = this.obtenerMinutosDelDia(disponibilidad.horaDesde);
      const finDisponibilidad = this.obtenerMinutosDelDia(disponibilidad.horaHasta);

      while (inicioTurno + duracionTurno <= finDisponibilidad) {
        const fechaHoraTurno = this.crearFechaConMinutos(
          fechaDisponibilidad,
          inicioTurno
        );

        sedes.forEach(sede => {
          const turnoDisponible = Turno.create({
            id: crypto.randomUUID(),
            medico,
            paciente: null,
            fechaHora: fechaHoraTurno,
            sede,
            especialidad: tipoPrestacion === 'especialidad' ? prestacion : null,
            practica: tipoPrestacion === 'practica' ? prestacion : null,
            estado: EstadoTurno.DISPONIBLE,
            historialEstados: [],
            costo: prestacion.costoConsulta ?? prestacion.costo,
          });

          turnosGenerados.push(turnoDisponible);
        });

        inicioTurno += DURACION_MODULO_EN_MINUTOS;
      }
    });

    return turnosGenerados;
  }

  generarTurnosParaEnRango(prestacion, medico, tipoPrestacion, fechaDesde, fechaHasta) {
    const turnosGenerados = [];
    const cantidadModulos = calcularCantidadModulos(this.obtenerDuracionPrestacion(prestacion));
    const duracionTurno = cantidadModulos * DURACION_MODULO_EN_MINUTOS;
    const sedes = medico.sedes?.length ? medico.sedes : [null];
    const diasDisponibles = new Set(
      (medico.disponibilidades ?? []).map(disponibilidad => this.obtenerNumeroDiaSemana(disponibilidad.diaSemana))
    );
    const fechaActual = this.crearInicioDia(fechaDesde);
    const fechaLimite = this.crearInicioDia(fechaHasta);

    while (fechaActual.getTime() <= fechaLimite.getTime()) {
      const diaSemana = obtenerPartesFechaArgentina(fechaActual).diaSemana;

      if (diasDisponibles.has(diaSemana)) {
        const disponibilidadesDelDia = medico.disponibilidades.filter(
          disponibilidad => this.obtenerNumeroDiaSemana(disponibilidad.diaSemana) === diaSemana
        );

        disponibilidadesDelDia.forEach(disponibilidad => {
          let inicioTurno = this.obtenerMinutosDelDia(disponibilidad.horaDesde);
          const finDisponibilidad = this.obtenerMinutosDelDia(disponibilidad.horaHasta);

          while (inicioTurno + duracionTurno <= finDisponibilidad) {
            const fechaHoraTurno = this.crearFechaConMinutos(fechaActual, inicioTurno);

            sedes.forEach(sede => {
              const turnoDisponible = Turno.create({
                id: crypto.randomUUID(),
                medico,
                paciente: null,
                fechaHora: fechaHoraTurno,
                sede,
                especialidad: tipoPrestacion === 'especialidad' ? prestacion : null,
                practica: tipoPrestacion === 'practica' ? prestacion : null,
                estado: EstadoTurno.DISPONIBLE,
                historialEstados: [],
                costo: prestacion.costoConsulta ?? prestacion.costo,
              });

              turnosGenerados.push(turnoDisponible);
            });

            inicioTurno += DURACION_MODULO_EN_MINUTOS;
          }
        });
      }

      fechaActual.setUTCDate(fechaActual.getUTCDate() + 1);
    }

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
      return obtenerMinutosDelDiaArgentina(valor);
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

    const partesHoy = obtenerPartesFechaArgentina(new Date());
    const diaObjetivo = dias[diaSemana];

    const diferenciaDias = (diaObjetivo - partesHoy.diaSemana + 7) % 7 || 7;
    const fechaBaseArgentina = new Date(Date.UTC(
      partesHoy.anio,
      partesHoy.mes - 1,
      partesHoy.dia
    ));

    fechaBaseArgentina.setUTCDate(fechaBaseArgentina.getUTCDate() + diferenciaDias);

    return crearFechaHoraArgentina({
      anio: fechaBaseArgentina.getUTCFullYear(),
      mes: fechaBaseArgentina.getUTCMonth() + 1,
      dia: fechaBaseArgentina.getUTCDate(),
    });
  }

  crearFechaConMinutos(fechaBase, minutosDelDia) {
    const partesFechaBase = obtenerPartesFechaArgentina(fechaBase);
    const horas = Math.floor(minutosDelDia / 60);
    const minutos = minutosDelDia % 60;

    return crearFechaHoraArgentina({
      anio: partesFechaBase.anio,
      mes: partesFechaBase.mes,
      dia: partesFechaBase.dia,
      horas,
      minutos,
    });
  }

  crearInicioDia(fecha) {
    const partesFecha = obtenerPartesFechaArgentina(fecha);

    return crearFechaHoraArgentina({
      anio: partesFecha.anio,
      mes: partesFecha.mes,
      dia: partesFecha.dia,
    });
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
    const mismaFecha = mismaFechaArgentina(turnoA.fechaHora, turnoB.fechaHora);
    
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
