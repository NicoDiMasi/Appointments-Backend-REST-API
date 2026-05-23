const ARGENTINA_OFFSET = '-03:00';
const ARGENTINA_OFFSET_EN_MS = 3 * 60 * 60 * 1000;
const TIENE_ZONA_HORARIA_REGEX = /(Z|[+-]\d{2}:?\d{2})$/i;

function pad(numero, longitud = 2) {
  return String(numero).padStart(longitud, '0');
}

function fechaArgentinaComoUtc(fecha) {
  return new Date(fecha.getTime() - ARGENTINA_OFFSET_EN_MS);
}

export function parsearFechaHoraArgentina(valor) {
  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor === 'string' && valor.trim() !== '') {
    const texto = valor.trim();
    const textoConZona = TIENE_ZONA_HORARIA_REGEX.test(texto)
      ? texto
      : `${texto}${ARGENTINA_OFFSET}`;

    return new Date(textoConZona);
  }

  return new Date(valor);
}

export function formatearFechaHoraArgentina(fecha) {
  const fechaArgentina = fechaArgentinaComoUtc(fecha);

  return [
    fechaArgentina.getUTCFullYear(),
    '-',
    pad(fechaArgentina.getUTCMonth() + 1),
    '-',
    pad(fechaArgentina.getUTCDate()),
    'T',
    pad(fechaArgentina.getUTCHours()),
    ':',
    pad(fechaArgentina.getUTCMinutes()),
    ':',
    pad(fechaArgentina.getUTCSeconds()),
    '.',
    pad(fechaArgentina.getUTCMilliseconds(), 3),
    ARGENTINA_OFFSET,
  ].join('');
}

export function obtenerDiaSemanaArgentina(fecha) {
  return fechaArgentinaComoUtc(fecha).getUTCDay();
}

export function obtenerMinutosDelDiaArgentina(fecha) {
  const fechaArgentina = fechaArgentinaComoUtc(fecha);

  return fechaArgentina.getUTCHours() * 60 + fechaArgentina.getUTCMinutes();
}

export function obtenerPartesFechaArgentina(fecha) {
  const fechaArgentina = fechaArgentinaComoUtc(fecha);

  return {
    anio: fechaArgentina.getUTCFullYear(),
    mes: fechaArgentina.getUTCMonth() + 1,
    dia: fechaArgentina.getUTCDate(),
    diaSemana: fechaArgentina.getUTCDay(),
    horas: fechaArgentina.getUTCHours(),
    minutos: fechaArgentina.getUTCMinutes(),
    segundos: fechaArgentina.getUTCSeconds(),
    milisegundos: fechaArgentina.getUTCMilliseconds(),
  };
}

export function crearFechaHoraArgentina({
  anio,
  mes,
  dia,
  horas = 0,
  minutos = 0,
  segundos = 0,
  milisegundos = 0,
}) {
  return new Date(Date.UTC(
    anio,
    mes - 1,
    dia,
    horas + 3,
    minutos,
    segundos,
    milisegundos
  ));
}

export function mismaFechaArgentina(fechaA, fechaB) {
  const fechaArgentinaA = fechaArgentinaComoUtc(fechaA);
  const fechaArgentinaB = fechaArgentinaComoUtc(fechaB);

  return (
    fechaArgentinaA.getUTCFullYear() === fechaArgentinaB.getUTCFullYear() &&
    fechaArgentinaA.getUTCMonth() === fechaArgentinaB.getUTCMonth() &&
    fechaArgentinaA.getUTCDate() === fechaArgentinaB.getUTCDate()
  );
}
