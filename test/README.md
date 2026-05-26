# Tests unitarios

La consigna pide tests unitarios sobre la capa de servicios y sobre la capa de dominio. En este proyecto los tests se organizaron por modulo funcional, priorizando reglas de negocio relevantes del sistema de turnos medicos.

## Como se ejecutan

Desde la raiz del proyecto:

```bash
npm test
```

El comando ejecuta Jest mediante el script definido en `package.json`:

```bash
node --experimental-vm-modules node_modules/jest/bin/jest.js
```

Resultado esperado actual:

```text
Test Suites: 7 passed, 7 total
Tests:       72 passed, 72 total
```

## Distribucion de los tests

### Capa de dominio

Los tests de dominio validan reglas propias de las entidades y objetos del negocio, sin depender de Express ni de la base de datos.

| Archivo | Capa | Que valida |
| --- | --- | --- |
| `test/turnos/Agenda.test.js` | Dominio | Generacion de turnos por modulos, redondeo de duracion a bloques completos y rechazo de horarios que no respetan el modulo de agenda. |
| `test/notificaciones/Notificacion.test.js` | Dominio | Creacion valida de notificaciones y validaciones obligatorias: destinatario, remitente, tipo de usuario, tipo de notificacion y mensaje. |

### Capa de servicios

Los tests de servicios validan casos de uso y reglas que coordinan repositorios, entidades y otros servicios. Se usan repositorios mock o datos controlados para aislar la logica de negocio.

| Archivo | Capa | Que valida |
| --- | --- | --- |
| `test/turnos/TurnoService.test.js` | Servicio | Ciclo de vida del turno, disponibilidad, turnos cercanos, superposicion, busqueda de turnos disponibles, filtros, actualizacion, baja, eliminacion y marcado como realizado. |
| `test/pacientes/PacienteTurnosService.test.js` | Servicio | Reserva, cancelacion con motivo y anticipacion, historial personal, cambio de turno manteniendo profesional y rechazo de cambios invalidos. |
| `test/medicos/MedicoService.test.js` | Servicio | Disponibilidades del medico, servicios ofrecidos, consultas de turnos de pacientes, cancelacion por medico y disponibilidad por especialidad o practica. |
| `test/obrasSociales/ObraSocialService.test.js` | Servicio | Obras sociales, planes, coberturas, niveles validos y busqueda de planes. |
| `test/notificaciones/NotificacionService.test.js` | Servicio | Creacion de notificaciones, consulta de leidas/no leidas y marcado como leida. |

## Casos decididos para testear

Se priorizaron escenarios que representan reglas centrales de la entrega:

- **Disponibilidad medica:** un turno solo puede reservarse si cae dentro de la disponibilidad horaria del medico.
- **Modulos de agenda:** los turnos se organizan en bloques de 20 minutos y deben iniciar alineados a esos modulos.
- **Superposicion de turnos:** no se permite crear o mover un turno si se superpone con otro turno vigente del mismo medico.
- **Turnos cercanos:** al consultar disponibilidad se informa si hay turnos cercanos o superpuestos en una ventana de tiempo.
- **Reserva de turnos:** el paciente puede reservar si la especialidad/practica, medico, sede y horario son validos.
- **Cancelacion:** pacientes y medicos deben indicar motivo y respetar la anticipacion minima de una hora.
- **Cambio de turno:** el paciente puede cambiar a otro slot disponible, pero debe conservar el mismo profesional.
- **Servicios medicos:** se valida alta, modificacion, baja y rechazo de servicios duplicados.
- **Disponibilidades:** se valida alta, modificacion, baja, rechazo de horarios invalidos y rechazo de disponibilidades duplicadas.
- **Persistencia conceptual de turnos existentes:** modificar la disponibilidad del medico no altera los turnos ya creados.
- **Busqueda de turnos:** se validan filtros por medico, especialidad/practica, sede y rango de fechas.
- **Cobertura y costo:** se validan niveles de cobertura de obras sociales y planes, base para calcular el monto a abonar.
- **Notificaciones:** se valida creacion, lectura de notificaciones pendientes/leidas y marcado como leida.

## Comportamiento que validan

Los tests no se limitan a probar respuestas exitosas. Tambien cubren rechazos y errores de negocio, por ejemplo:

- crear un turno fuera de disponibilidad;
- solicitar un horario que no inicia en modulo valido;
- reservar o mover un turno que se superpone con otro;
- cancelar sin motivo;
- cancelar con menos de una hora de anticipacion;
- cambiar un turno a otro profesional;
- consultar una practica que el medico no realiza;
- crear servicios duplicados;
- definir disponibilidades con horario invalido;
- marcar como leida una notificacion inexistente;
- usar niveles de cobertura invalidos.

Esto permite demostrar que la suite protege reglas relevantes del dominio y no solamente caminos triviales.

## Relacion con la exposicion

Durante la demo se puede mostrar:

1. La estructura de carpetas dentro de `test/`.
2. Un test de dominio, por ejemplo `Agenda.test.js`, para explicar modulos, disponibilidad y superposicion.
3. Un test de servicio, por ejemplo `PacienteTurnosService.test.js` o `TurnoService.test.js`, para explicar reserva, cancelacion y cambio.
4. La ejecucion de `npm test`.
5. El resultado completo de la suite pasando.

