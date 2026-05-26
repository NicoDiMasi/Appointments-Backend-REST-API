# Sweet Medical

API de gestion de turnos medicos desarrollada con Node.js, Express y MongoDB.

El proyecto esta organizado por modulos y separa responsabilidades entre routers, controllers, services, repositories, dominio, schemas y errores.

## Integrantes

- Franco M. Cortinez
- Nahuel Barbaro
- Nicolas Di Masi
- Luciano Bauso

## Requisitos

- Node.js v18 o superior
- npm
- Git
- MongoDB disponible localmente o mediante una URI remota

## Instalacion

```bash
npm install
```

Crear un archivo `.env` con la conexion a MongoDB:

```env
MONGO_URI=mongodb://localhost:27017/sweet-medical
PORT=3000
```

`PORT` es opcional. Si no se informa, la API usa `3000`.

En PowerShell, si `npm` esta bloqueado por politicas de ejecucion, usar `npm.cmd`.

## Datos iniciales

La API persiste datos en MongoDB mediante Mongoose. Para cargar o actualizar los datos base:

```bash
npm run seed:mongo
```

El seed hace upsert de medicos, pacientes y obras sociales, por lo que se puede ejecutar mas de una vez. Los turnos pueden generarse o reservarse luego mediante los endpoints de la API para realizar las pruebas funcionales de la demo.

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

La documentacion interactiva se sirve en:

```text
http://localhost:3000/documentacion
```

Archivos principales de arranque:

- `src/server.js`
- `src/app.js`
- `src/config/database.js`
- `src/modules/routes/router.js`

## Testing

Ejecutar todos los tests:

```bash
npm test
```

Los tests unitarios mockean repositorios cuando lo necesitan, asi que no requieren una conexion real a MongoDB.

## Scripts

| Script | Descripcion |
| --- | --- |
| `npm run dev` | Levanta el servidor Express y conecta a MongoDB |
| `npm test` | Ejecuta Jest con soporte para ES Modules |
| `npm run seed:mongo` | Carga datos base en MongoDB |

## Endpoints

### Generales

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/` | Mensaje de bienvenida |
| GET | `/health` | Estado de salud del sistema |
| GET | `/documentacion` | Swagger UI con la documentacion OpenAPI |

### Medicos

El modulo esta montado en `/medicos`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/medicos` | Lista medicos |
| POST | `/medicos` | Crea un medico |
| GET | `/medicos/:medicoId` | Busca un medico por ID |
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
| PATCH | `/medicos/:medicoId/turnos/:turnoId` | Actualiza o cancela un turno del medico |

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
| PATCH | `/turnos/:id` | Actualiza, cancela o marca como realizado un turno |
| DELETE | `/turnos/:id` | Elimina un turno |

### Pacientes

El modulo esta montado en `/pacientes`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/pacientes` | Lista pacientes activos |
| POST | `/pacientes` | Crea un paciente |
| GET | `/pacientes/:id` | Busca un paciente por ID |
| PATCH | `/pacientes/:id` | Actualiza un paciente |
| DELETE | `/pacientes/:id` | Realiza baja logica del paciente |
| GET | `/pacientes/:id/turnos` | Consulta historial personal de turnos |
| POST | `/pacientes/:id/turnos` | Reserva un turno validando disponibilidad |
| GET | `/pacientes/:id/turnos/disponibles` | Busca slots disponibles para el paciente con cobertura, monto y paginacion |
| PATCH | `/pacientes/:id/turnos/:turnoId/cancelacion` | Cancela un turno del paciente con motivo |
| PATCH | `/pacientes/:id/turnos/:turnoId/cambio` | Cambia el turno a otro slot disponible del mismo profesional |

### Notificaciones

El modulo esta montado en `/notificaciones`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/notificaciones/usuarios/:usuarioId` | Lista notificaciones del usuario. Usa `?leida=true` para leidas; sin ese query devuelve no leidas |
| PATCH | `/notificaciones/:id/leida` | Marca una notificacion como leida |

Ejemplos:

```bash
curl "http://localhost:3000/notificaciones/usuarios/med-001"
curl "http://localhost:3000/notificaciones/usuarios/pac-001?leida=true"
curl -X PATCH http://localhost:3000/notificaciones/notif-xxx/leida
```

## Reglas de negocio implementadas

- Los turnos se organizan en modulos de 20 minutos.
- Una prestacion puede ocupar uno o mas modulos segun su duracion.
- Al crear, reservar o mover un turno se valida disponibilidad horaria, alineacion al modulo y no superposicion con otros turnos del mismo medico.
- La busqueda de turnos disponibles permite filtrar por profesional, especialidad, practica, sede y rango de fechas.
- La busqueda desde paciente agrega cobertura, costo base, monto a abonar, ordenamiento y paginacion.
- La cancelacion exige al menos 1 hora de anticipacion y motivo cuando cancela paciente o medico.
- El cambio de turno del paciente mantiene el mismo profesional.
- Si un medico modifica su disponibilidad, no se reprograman turnos existentes; impacta en nuevas consultas y generaciones.
- Las fechas de respuesta se formatean en horario Argentina (`-03:00`).
- Las notificaciones se generan de forma asincronica y no bloquean el flujo principal del turno.
- El servidor programa recordatorios diarios para turnos del dia siguiente.

## Datos base del seed

### Medicos

| ID | Nombre | Especialidades | Practicas | Sedes | Disponibilidades |
| --- | --- | --- | --- | --- | --- |
| `med-001` | Ana Gomez | Cardiologia, Clinica Medica | `pra-001` Electrocardiograma | Sede Central, Sede Norte | LUNES 08:00-12:00, MIERCOLES 14:00-18:00, VIERNES 09:00-13:00 |
| `med-002` | Carlos Perez | Neurologia | `pra-002` Electroencefalograma | Sede Norte | MARTES 07:00-11:00, JUEVES 15:00-19:00, SABADO 08:00-12:00 |
| `med-003` | Laura Martinez | Pediatria | `pra-003` Control pediatrico | Sede Sur | LUNES 10:00-14:00, MIERCOLES 16:00-20:00, VIERNES 08:30-12:30 |

### Pacientes

| ID | Nombre | DNI | Obra social | Plan |
| --- | --- | --- | --- | --- |
| `pac-001` | Juan Lopez | 30111222 | `os-001` OSDE | `plan-210` 210 |
| `pac-002` | Maria Fernandez | 32999888 | `os-002` Swiss Medical | `plan-smg20` SMG20 |
| `pac-003` | Pedro Ramirez | 28777666 | Sin obra social | Sin plan |

### Obras sociales

| ID | Nombre | Planes |
| --- | --- | --- |
| `os-001` | OSDE | `plan-210` 210 |
| `os-002` | Swiss Medical | `plan-smg20` SMG20 |

### Sedes

| ID | Nombre | Direccion |
| --- | --- | --- |
| `sede-001` | Sede Central | Av. Siempre Viva 123 |
| `sede-002` | Sede Norte | Calle Falsa 456 |
| `sede-003` | Sede Sur | San Martin 789 |

## Ejemplos rapidos

Consultar disponibilidad:

```bash
curl "http://localhost:3000/turnos/disponibilidades?medicoId=med-001&fechaHora=2026-06-01T09:20:00.000-03:00&especialidadId=esp-001"
```

Buscar turnos disponibles para un paciente con cobertura:

```bash
curl "http://localhost:3000/pacientes/pac-001/turnos/disponibles?especialidadId=esp-001&sedeId=sede-001&page=1&limit=5&sortBy=fecha&sortOrder=asc"
```

Reservar turno:

```bash
curl -X POST http://localhost:3000/pacientes/pac-001/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "tur-pac-001",
    "medicoId": "med-001",
    "especialidadId": "esp-001",
    "fechaHora": "2026-06-01T09:20:00.000-03:00",
    "sede": {
      "id": "sede-001",
      "nombre": "Sede Central",
      "direccion": "Av. Siempre Viva 123"
    }
  }'
```

Cancelar turno desde paciente:

```bash
curl -X PATCH http://localhost:3000/pacientes/pac-001/turnos/tur-pac-001/cancelacion \
  -H "Content-Type: application/json" \
  -d '{ "motivo": "El paciente no puede asistir" }'
```

## Estructura del proyecto

```text
src/
|-- app.js
|-- server.js
|-- config/
|   `-- database.js
|-- errors/
|-- middlewares/
|-- utils/
`-- modules/
    |-- health/
    |-- routes/
    |-- medicos/
    |-- pacientes/
    |-- turnos/
    |-- obrasSociales/
    `-- notificaciones/

docs/
`-- documentacion-api.yaml

test/
|-- docs/
|-- medicos/
|-- pacientes/
|-- turnos/
|-- obrasSociales/
|-- notificaciones/
`-- postman/
```

## Tests existentes

| Archivo | Cubre |
| --- | --- |
| `test/medicos/MedicoService.test.js` | Medicos, servicios, disponibilidades, turnos vistos por medico y disponibilidad por prestacion |
| `test/pacientes/PacienteTurnosService.test.js` | Reserva, cancelacion, historial, cambio y busqueda de turnos para pacientes |
| `test/turnos/Agenda.test.js` | Generacion de turnos, modulos y validacion de agenda |
| `test/turnos/TurnoService.test.js` | CRUD de turnos, disponibilidad, cercanos, cancelacion y realizado |
| `test/obrasSociales/ObraSocialService.test.js` | Obras sociales, planes, coberturas y niveles de cobertura |
| `test/notificaciones/Notificacion.test.js` | Reglas de dominio de notificaciones |
| `test/notificaciones/NotificacionService.test.js` | Creacion, consulta y marcado como leida |

## Pruebas manuales

- Guias con ejemplos: `test/docs/`
- Colecciones Postman: `test/postman/`
- OpenAPI: `docs/documentacion-api.yaml`
