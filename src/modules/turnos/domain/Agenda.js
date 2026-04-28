export class Agenda {

  generarTurnosPara(especialidad, medico) {


  }

  generarTurnosParaPractica(practica, medico) {}

  refrescarTurnosSegunDisponibilidadDe(medico) {}

  validarTurno(turno, medico){ //Mepa que esto iría mas en turnos

  }

  seSuperponen(inicioA, finA, inicioB, finB){ 
    return inicioA < finB && finA > inicioB
  }

  validarDiaYHorario(turno, disponibilidades){
    const diaTurno = obtenerDiaSemana(turno.fechaHora);
    const inicioTurno = obtenerMinutosDelDia(turno.fechaHora);
    const finTurno = inicioTurno + turno.duracionTurno;

    disponibilidades.some((disponibilidadHoraria) => {
      const inicioDisponibilidad = obtenerMinutosDelDia(disponibilidadHoraria.horaDesde);
      const finDisponibilidad = obtenerMinutosDelDia(disponibilidadHoraria.horaHasta);
      const diaDisponibilidad = disponibilidadHoraria.diaSemana;
      return diaDisponibilidad === diaTurno && inicioTurno >= inicioDisponibilidad && finTurno <= finDisponibilidad;
  })
  }
  obtenerDiaSemana(fechaHora) {
    return new Date(fechaHora).getDay();
  }

  obtenerMinutosDelDia(fechaHora) {
    const fecha = new Date(fechaHora);
    return fecha.getHours() * 60 + fecha.getMinutes();
  }

}
