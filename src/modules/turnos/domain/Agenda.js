import { Turno } from './Turno.js';
import { EstadoTurno } from './EstadoTurno.js';

export class Agenda {

  generarTurnosPara(especialidad, medico) {
    const turnosGenerados = [];

    medico.disponibilidades.forEach(disponibilidad => {
      const fechaDisponibilidad = this.obtenerProximaFechaParaDia(
        disponibilidad.diaSemana
      );

      let inicioTurno = this.obtenerMinutosDesdeHora(disponibilidad.horaDesde);
      const finDisponibilidad = this.obtenerMinutosDesdeHora(disponibilidad.horaHasta);

      while (inicioTurno + especialidad.duracionTurnoEnMins <= finDisponibilidad) {
        const fechaHoraTurno = this.crearFechaConMinutos(
          fechaDisponibilidad,
          inicioTurno
        );

        const turnoDisponible = Turno.create({
          id: crypto.randomUUID(), //Esto crea un ID Random
          medico,
          paciente: null,
          fechaHora: fechaHoraTurno,
          sede: null,
          practica: especialidad, //VER ESTO
          estado: EstadoTurno.DISPONIBLE,
          historialEstados: [],
          costo: especialidad.costoConsulta,
        });

        turnosGenerados.push(turnoDisponible);

        inicioTurno += especialidad.duracionTurnoEnMins;
      }
    });

    return turnosGenerados;

  }

  generarTurnosParaPractica(practica, medico) {
    const turnosGenerados = [];

    medico.disponibilidades.forEach(disponibilidad => {
      const fechaDisponibilidad = this.obtenerProximaFechaParaDia(
        disponibilidad.diaSemana
      );

      let inicioTurno = this.obtenerMinutosDesdeHora(disponibilidad.horaDesde);
      const finDisponibilidad = this.obtenerMinutosDesdeHora(disponibilidad.horaHasta);

      while (inicioTurno + practica.duracionTurnoEnMins <= finDisponibilidad) {
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
          practica,
          estado: EstadoTurno.DISPONIBLE,
          historialEstados: [],
          costo: practica.costoConsulta,
        });

        turnosGenerados.push(turnoDisponible);

        inicioTurno += practica.duracionTurnoEnMins;
      }
    });

    return turnosGenerados;
  }

  refrescarTurnosSegunDisponibilidadDe(medico) { }

  estaDisponible(turno, turnosDelMedico){

    return this.validarDiaYHorario(turno, turno.medico.disponibilidades) && 
    !turnosDelMedico.some((turnoOcupado) =>{
      return this.seSuperponen(turno,turnoOcupado);
    }) 
  validarTurno(turno, medico) { //Mepa que iria mas en turno esto
    return this.validarDiaYHorario(turno, medico.disponibilidades);
  }


  seSuperponen(turnoA, turnoB){ 
    return turnoA.inicioTurno() < turnoB.finTurno() && turnoA.finTurno() > turnoB.inicioTurno();
  }

  validarDiaYHorario(turno, disponibilidades){

    return disponibilidades.some((disponibilidadHoraria) => {
      const inicioDisponibilidad = this.obtenerMinutosDelDia(disponibilidadHoraria.horaDesde);
      const finDisponibilidad = this.obtenerMinutosDelDia(disponibilidadHoraria.horaHasta);
      const diaDisponibilidad = disponibilidadHoraria.diaSemana;
      return diaDisponibilidad === turno.diaTurno() && turno.inicioTurno() >= inicioDisponibilidad && turno.finTurno() <= finDisponibilidad;
  })
  }

  obtenerDiaSemana(fechaHora) {
    const dias = [
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
    ];

    return dias[new Date(fechaHora).getDay()];
  }

  obtenerMinutosDelDia(valor) {
    if (valor instanceof Date) {
      return valor.getHours() * 60 + valor.getMinutes();
    }

    if (typeof valor === "string") {
      const [horas, minutos] = valor.split(":").map(Number);
      return horas * 60 + minutos;
    }

    throw new Error("Formato de hora inválido");
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

  obtenerMinutosDesdeHora(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  crearFechaConMinutos(fechaBase, minutosDelDia) {
    const fecha = new Date(fechaBase);
    const horas = Math.floor(minutosDelDia / 60);
    const minutos = minutosDelDia % 60;

    fecha.setHours(horas, minutos, 0, 0);

    return fecha;
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

  obtenerMinutosDesdeHora(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  crearFechaConMinutos(fechaBase, minutosDelDia) {
    const fecha = new Date(fechaBase);
    const horas = Math.floor(minutosDelDia / 60);
    const minutos = minutosDelDia % 60;

    fecha.setHours(horas, minutos, 0, 0);

    return fecha;
  }

}
