

export class Agenda {

  generarTurnosPara(especialidad, medico) {


  }

  generarTurnosParaPractica(practica, medico) {}

  refrescarTurnosSegunDisponibilidadDe(medico) {}

  estaDisponible(turno, turnosDelMedico){

    return this.validarDiaYHorario(turno, turno.medico.disponibilidades) && 
    !turnosDelMedico.some((turnoOcupado) =>{
      return this.seSuperponen(turno,turnoOcupado);
    }) 
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
    return new Date(fechaHora).getDay();
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

}
