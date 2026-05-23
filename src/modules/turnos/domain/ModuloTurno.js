export const DURACION_MODULO_EN_MINUTOS = 20;

export function calcularCantidadModulos(duracionEnMinutos) {
  if (!Number.isInteger(duracionEnMinutos) || duracionEnMinutos <= 0) {
    throw new Error('La duracion debe ser un entero positivo');
  }

  return Math.ceil(duracionEnMinutos / DURACION_MODULO_EN_MINUTOS);
}

export function calcularDuracionModular(cantidadModulos) {
  return calcularCantidadModulos(cantidadModulos) * DURACION_MODULO_EN_MINUTOS;
}
