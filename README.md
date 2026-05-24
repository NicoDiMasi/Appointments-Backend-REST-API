# Sweet Medical

API de gestion de turnos medicos desarrollada con Node.js y Express.

El proyecto esta organizado por modulos y separa responsabilidades entre routers, controllers, services, repositories, dominio y errores.

## Integrantes

- Franco M. Cortinez
- Nahuel Barbaro
- Nicolas Di Masi
- Luciano Bauso

## Requisitos

- Node.js v18 o superior
- npm
- Git

Instalar dependencias:

```bash
npm install
```

En PowerShell, si `npm` esta bloqueado por politicas de ejecucion, usar `npm.cmd`.

## Ejecucion

```bash
npm run dev
```

O en PowerShell:

```bash
npm.cmd run dev
```

La API queda disponible en:

```text
http://localhost:3000
```

Archivos principales de arranque:

- `src/server.js`
- `src/app.js`
- `src/modules/routes/router.js`

## Testing

Ejecutar todos los tests:

```bash
npm test
```

O en PowerShell:

```bash
npm.cmd test
```

El proyecto usa Jest con ES Modules:

```json
{
  "type": "module",
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "dev": "node src/server.js"
  }
}
```

## Endpoints

### Generales

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/` | Mensaje de bienvenida |
| GET | `/health` | Estado de salud del sistema |

Ejemplo:

```bash
curl http://localhost:3000/health
```

### Medicos

El modulo esta montado en `/medicos`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/medicos/:medicoId/servicios` | Lista especialidades y practicas ofrecidas por el medico |
| POST | `/medicos/:medicoId/servicios` | Agrega una especialidad o practica al medico |
| PATCH | `/medicos/:medicoId/servicios/:tipo/:servicioId` | Modifica una especialidad o practica del medico |
| DELETE | `/medicos/:medicoId/servicios/:tipo/:servicioId` | Elimina una especialidad o practica del medico |
| GET | `/medicos/:medicoId/disponibilidades` | Lista disponibilidades horarias del medico |
| POST | `/medicos/:medicoId/disponibilidades` | Agrega una disponibilidad horaria |
| PATCH | `/medicos/:medicoId/disponibilidades/:diaSemana` | Actualiza una disponibilidad |
| DELETE | `/medicos/:medicoId/disponibilidades/:diaSemana` | Elimina una disponibilidad |
| GET | `/medicos/:medicoId/disponibilidades-turnos` | Consulta disponibilidad del medico para especialidad o practica |
| GET | `/medicos/:medicoId/pacientes/:pacienteId/turnos` | Consulta turnos de un paciente con ese medico |
| PATCH | `/medicos/:medicoId/turnos/:turnoId` | Actualiza un turno del medico; permite cancelar con motivo |

### Obras sociales

El modulo esta montado en `/obras-sociales`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/obras-sociales` | Lista obras sociales con planes y coberturas |
| GET | `/obras-sociales/:obraSocialId` | Busca una obra social por ID |
| GET | `/obras-sociales/:obraSocialId/planes` | Lista planes de una obra social |
| GET | `/obras-sociales/:obraSocialId/planes/:planId` | Busca un plan por ID |

### Turnos

El modulo esta montado en `/turnos`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/turnos` | Lista turnos |
| POST | `/turnos` | Crea un turno |
| GET | `/turnos/disponibilidades` | Consulta disponibilidad para un horario |
| GET | `/turnos/disponibles` | Busca slots disponibles por medico, especialidad, practica, sede y rango de fechas |
| POST | `/turnos/solicitudes` | Solicita un turno y devuelve el analisis de disponibilidad |
| GET | `/turnos/:id` | Busca un turno por ID |
| PATCH | `/turnos/:id` | Actualiza un turno; permite cancelar o marcar realizado |
| DELETE | `/turnos/:id` | Elimina un turno |

### Pacientes

El modulo esta montado en `/pacientes`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/pacientes` | Lista pacientes |
| POST | `/pacientes` | Crea un paciente |
| GET | `/pacientes/:id` | Busca un paciente por ID |
| PATCH | `/pacientes/:id` | Actualiza un paciente |
| DELETE | `/pacientes/:id` | Elimina un paciente |
| GET | `/pacientes/:id/turnos` | Consulta historial personal de turnos |
| POST | `/pacientes/:id/turnos` | Reserva un turno validando disponibilidad |
| PATCH | `/pacientes/:id/turnos/:turnoId/cancelacion` | Cancela un turno del paciente con motivo |
| PATCH | `/pacientes/:id/turnos/:turnoId/cambio` | Cambia el turno a otro slot disponible del mismo profesional |

## Reglas de negocio implementadas

- Los turnos se organizan en modulos de 20 minutos.
- Una prestacion puede ocupar uno o mas modulos segun su duracion.
- La busqueda de turnos disponibles para pacientes permite filtrar por profesional, especialidad, practica, sede y rango de fechas.
- Al crear, reservar o mover un turno se valida:
  - disponibilidad horaria del medico,
  - inicio alineado al modulo de 20 minutos,
  - no superposicion con otros turnos del mismo medico.
- La cancelacion exige al menos 1 hora de anticipacion.
- La cancelacion de paciente exige motivo.
- La cancelacion desde medico exige motivo.
- El cambio de turno del paciente mantiene el mismo profesional.
- Si un medico modifica su disponibilidad, no se reprograman turnos existentes; impacta en nuevas consultas y generaciones.
- Las fechas de respuesta se formatean en horario Argentina (`-03:00`).

## Datos mock cargados

Los datos viven en memoria. Al reiniciar el servidor vuelven a su estado inicial.

### Medicos

| ID | Nombre | Especialidades | Practicas | Sedes | Disponibilidades |
| --- | --- | --- | --- | --- | --- |
| `med-001` | Ana Gomez | Cardiologia, Clinica Medica | `pra-001` Electrocardiograma | Sede Central, Sede Norte | LUNES 08:00-12:00, MIERCOLES 14:00-18:00, VIERNES 09:00-13:00 |
| `med-002` | Carlos Perez | Neurologia | `pra-002` Electroencefalograma | Sede Norte | MARTES 07:00-11:00, JUEVES 15:00-19:00, SABADO 08:00-12:00 |
| `med-003` | Laura Martinez | Pediatria | `pra-003` Control pediatrico | Sede Sur | LUNES 10:00-14:00, MIERCOLES 16:00-20:00, VIERNES 08:30-12:30 |

### Sedes

| ID | Nombre | Direccion |
| --- | --- | --- |
| `sede-001` | Sede Central | Av. Siempre Viva 123 |
| `sede-002` | Sede Norte | Calle Falsa 456 |
| `sede-003` | Sede Sur | San Martin 789 |

### Pacientes

| ID | Nombre | DNI | Obra social | Plan |
| --- | --- | --- | --- | --- |
| `pac-001` | Juan Lopez | 30111222 | OSDE | 210 |
| `pac-002` | Maria Fernandez | 32555666 | Swiss Medical | SMG20 |
| `pac-003` | Pedro Ramirez | 28999888 | Sin obra social | Sin plan |

### Obras sociales

| ID | Nombre | Planes |
| --- | --- | --- |
| `os-001` | OSDE | `plan-210` 210 |
| `os-002` | Swiss Medical | `plan-smg20` SMG20 |

### Turnos

| ID | Medico | Estado | Horario |
| --- | --- | --- | --- |
| `tur-001` | `med-001` | DISPONIBLE | Proximo LUNES 08:40 |
| `tur-002` | `med-002` | CONFIRMADO | Proximo MARTES 08:00 |
| `tur-003` | `med-003` | DISPONIBLE | Proximo VIERNES 09:00 |

## Ejemplos de uso

### Consultar disponibilidad por especialidad

Desde turnos:

```bash
curl "http://localhost:3000/turnos/disponibilidades?medicoId=med-001&fechaHora=2026-05-25T09:20:00.000-03:00&especialidadId=esp-001"
```

Desde medicos:

```bash
curl "http://localhost:3000/medicos/med-001/disponibilidades-turnos?fechaHora=2026-05-25T09:20:00.000-03:00&especialidadId=esp-001"
```

### Consultar disponibilidad por practica

```bash
curl "http://localhost:3000/medicos/med-001/disponibilidades-turnos?fechaHora=2026-05-25T09:20:00.000-03:00&tipoPrestacion=practica&practicaId=pra-001"
```

Respuesta esperada parcial:

```json
{
  "disponible": true,
  "medicoId": "med-001",
  "fechaHora": "2026-05-25T09:20:00.000-03:00",
  "duracionPrestacion": 45,
  "duracionTurno": 60,
  "modulosRequeridos": 3,
  "turnosCercanos": []
}
```

### Buscar turnos disponibles para pacientes

Por especialidad, sede y rango de fechas:

```bash
curl "http://localhost:3000/turnos/disponibles?especialidadId=esp-001&sedeId=sede-001&fechaDesde=2026-05-25T00:00:00.000-03:00&fechaHasta=2026-05-25T23:59:00.000-03:00"
```

Por practica con medico especifico:

```bash
curl "http://localhost:3000/turnos/disponibles?medicoId=med-001&tipoPrestacion=practica&practicaId=pra-001&sedeId=sede-002"
```

### Reservar un turno para un paciente

```bash
curl -X POST http://localhost:3000/pacientes/pac-001/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "tur-pac-001",
    "medicoId": "med-001",
    "especialidadId": "esp-001",
    "fechaHora": "2026-05-25T09:20:00.000-03:00",
    "sede": {
      "id": "sede-001",
      "nombre": "Sede Central"
    }
  }'
```

### Consultar historial de turnos de un paciente

```bash
curl http://localhost:3000/pacientes/pac-001/turnos
```

Desde medico:

```bash
curl http://localhost:3000/medicos/med-001/pacientes/pac-001/turnos
```

### Cancelar un turno del paciente

```bash
curl -X PATCH http://localhost:3000/pacientes/pac-001/turnos/tur-pac-001/cancelacion \
  -H "Content-Type: application/json" \
  -d '{
    "motivo": "El paciente no puede asistir"
  }'
```

### Cancelar un turno desde medico

```bash
curl -X PATCH http://localhost:3000/medicos/med-001/turnos/tur-001 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "CANCELADO",
    "motivo": "El medico no puede atender"
  }'
```

### Marcar turno como realizado

```bash
curl -X PATCH http://localhost:3000/turnos/tur-001 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "REALIZADO",
    "usuario": {
      "id": "med-001",
      "nombre": "Ana Gomez"
    }
  }'
```

### Cambiar turno de un paciente

```bash
curl -X PATCH http://localhost:3000/pacientes/pac-001/turnos/tur-pac-001/cambio \
  -H "Content-Type: application/json" \
  -d '{
    "fechaHora": "2026-05-25T10:00:00.000-03:00"
  }'
```

### Gestion de servicios medicos

Los servicios del medico pueden ser `especialidad` o `practica`.

```bash
curl http://localhost:3000/medicos/med-001/servicios
```

Alta de una especialidad:

```bash
curl -X POST http://localhost:3000/medicos/med-001/servicios \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "especialidad",
    "id": "esp-010",
    "nombre": "Dermatologia",
    "duracionTurnoEnMins": 20,
    "costoConsulta": 4500
  }'
```

Alta de una practica:

```bash
curl -X POST http://localhost:3000/medicos/med-001/servicios \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "practica",
    "id": "pra-010",
    "codigo": "ECO",
    "nombre": "Ecografia",
    "duracionTurnoEnMins": 40,
    "costo": 8000
  }'
```

Modificacion:

```bash
curl -X PATCH http://localhost:3000/medicos/med-001/servicios/practica/pra-010 \
  -H "Content-Type: application/json" \
  -d '{
    "costo": 8500,
    "duracionTurnoEnMins": 60
  }'
```

Baja:

```bash
curl -X DELETE http://localhost:3000/medicos/med-001/servicios/practica/pra-010
```

### CRUD de disponibilidades medicas

```bash
curl http://localhost:3000/medicos/med-001/disponibilidades
```

```bash
curl -X POST http://localhost:3000/medicos/med-001/disponibilidades \
  -H "Content-Type: application/json" \
  -d '{
    "diaSemana": "MARTES",
    "horaDesde": "13:00",
    "horaHasta": "16:00"
  }'
```

```bash
curl -X PATCH http://localhost:3000/medicos/med-001/disponibilidades/MARTES \
  -H "Content-Type: application/json" \
  -d '{
    "horaDesde": "14:00",
    "horaHasta": "17:00"
  }'
```

```bash
curl -X DELETE http://localhost:3000/medicos/med-001/disponibilidades/MARTES
```

Dias validos: `DOMINGO`, `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES`, `SABADO`.

## Estructura del proyecto

```text
2026-1c-backend-grupo-05/
|-- README.md
|-- package.json
|-- package-lock.json
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- errors/
|   |   `-- AppError.js
|   |-- middlewares/
|   |   |-- errorHandler.js
|   |   |-- errorLogger.js
|   |   `-- notFoundHandler.js
|   |-- utils/
|   |   `-- dateTime.js
|   `-- modules/
|       |-- health/
|       |   `-- health.router.js
|       |-- routes/
|       |   `-- router.js
|       |-- medicos/
|       |   |-- medicos.router.js
|       |   |-- controller/
|       |   |   `-- MedicoController.js
|       |   |-- domain/
|       |   |   |-- DiaSemana.js
|       |   |   |-- DisponibilidadHoraria.js
|       |   |   |-- Especialidad.js
|       |   |   |-- Medico.js
|       |   |   `-- Practica.js
|       |   |-- errors/
|       |   |   `-- MedicoErrors.js
|       |   |-- repository/
|       |   |   `-- MedicoRepository.js
|       |   `-- service/
|       |       `-- MedicoService.js
|       |-- pacientes/
|       |   |-- pacientes.router.js
|       |   |-- controller/
|       |   |   `-- PacienteController.js
|       |   |-- domain/
|       |   |   `-- Paciente.js
|       |   |-- errors/
|       |   |   `-- PacienteErrors.js
|       |   |-- repository/
|       |   |   `-- PacienteRepository.js
|       |   `-- service/
|       |       `-- PacienteService.js
|       `-- turnos/
|           |-- turno.router.js
|           |-- controller/
|           |   `-- turnoController.js
|           |-- domain/
|           |   |-- Agenda.js
|           |   |-- CambioEstadoTurno.js
|           |   |-- EstadoTurno.js
|           |   |-- ModuloTurno.js
|           |   `-- Turno.js
|           |-- errors/
|           |   `-- TurnoErrors.js
|           |-- mocks/
|           |   `-- turnos.mocks.js
|           |-- repository/
|           |   `-- TurnoRepository.js
|           `-- service/
|               `-- TurnoService.js
`-- test/
    |-- medicos/
    |   `-- MedicoService.test.js
    |-- pacientes/
    |   `-- PacienteTurnosService.test.js
    |-- turnos/
    |   |-- Agenda.test.js
    |   `-- TurnoService.test.js
    `-- postman/
        |-- Disponibilidad Medicos.postman_collection.json
        `-- Disponibilidad Medicos - Con validacion.postman_collection.json
```

## Flujo interno de una request

```text
Cliente HTTP
  -> Router
  -> Controller
  -> Service
  -> Repository
  -> Domain / datos en memoria
```

## Tests existentes

| Archivo | Cubre |
| --- | --- |
| `test/medicos/MedicoService.test.js` | Servicios medicos, disponibilidades medicas, turnos vistos por medico y disponibilidad por prestacion |
| `test/pacientes/PacienteTurnosService.test.js` | Reserva, cancelacion, historial y cambio de turnos de pacientes |
| `test/turnos/Agenda.test.js` | Generacion de turnos, modulos y validacion de agenda |
| `test/turnos/TurnoService.test.js` | CRUD de turnos, disponibilidad, cercanos, cancelacion y realizado |

## Flujo de ramas

El trabajo se organizo con ramas de funcionalidad y ramas de integracion. El flujo se reconstruyo a partir del historial de Git local/remoto:

- `main`: rama base del proyecto.
- `feature/setup-health`: configuracion inicial de Express y endpoint `/health`; luego se mergeo a `main`.
- `entrega1`: rama local usada para integrar las funcionalidades iniciales de disponibilidad medica.
- `feature/crear-disponibilidad-medico`: alta de disponibilidades medicas.
- `feature/listar-disponibilidades-medico`: listado de disponibilidades.
- `feature/actualizar-disponibilidad-medico`: actualizacion de disponibilidades.
- `feature/eliminar-disponibilidad-medico`: eliminacion de disponibilidades, controller y colecciones Postman.
- `feature/turnos`: modulo de turnos, agenda, service, repository, controller y tests.
- `rescate-turnos`: rama auxiliar integrada dentro de `feature/turnos` para recuperar logica de generacion de turnos.
- `Entrega-1`: rama de integracion de disponibilidades medicas y turnos; luego se mergeo a `main` mediante PR #2.
- `Entrega-2`: rama creada despues de `Entrega-1`, usada para pacientes, modulos, UTC-3, endpoints REST, disponibilidad por prestacion, especialidades y practicas.

Diagrama resumido:

```text
main
|-- feature/setup-health
|   `-- merge a main
|
|-- entrega1
|   |-- feature/crear-disponibilidad-medico
|   |-- feature/listar-disponibilidades-medico
|   |-- feature/actualizar-disponibilidad-medico
|   `-- feature/eliminar-disponibilidad-medico
|
|-- feature/turnos
|   `-- rescate-turnos
|
|-- Entrega-1
|   |-- integra disponibilidades medicas
|   |-- integra feature/turnos
|   `-- merge a main mediante PR #2
|
`-- Entrega-2
    |-- pacientes
    |-- modulos de turnos
    |-- disponibilidad y solicitudes
    |-- ajustes REST
    |-- horario Argentina UTC-3
    |-- endpoints medicos/pacientes
    `-- especialidades y practicas
```

## Notas de desarrollo

- La persistencia actual es en memoria mediante repositories mock.
- Reiniciar el servidor restaura los datos iniciales.
- Las colecciones Postman existentes estan en `test/postman/`.
- Tambien se puede probar manualmente con Insomnia usando los ejemplos de este README.
