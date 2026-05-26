# Turnos

Usar `{{baseUrl}}` como `http://localhost:3000`.

## GET /turnos

Lista turnos guardados.

```http
GET {{baseUrl}}/turnos
```

## GET /turnos/:id

Busca un turno por ID.

```http
GET {{baseUrl}}/turnos/tur-001
```

## GET /turnos/disponibilidades

Consulta disponibilidad para un horario especifico.

Por especialidad:

```http
GET {{baseUrl}}/turnos/disponibilidades?medicoId=med-001&fechaHora=2026-05-25T09:20:00.000-03:00&especialidadId=esp-001
```

Por practica:

```http
GET {{baseUrl}}/turnos/disponibilidades?medicoId=med-001&fechaHora=2026-05-25T09:20:00.000-03:00&tipoPrestacion=practica&practicaId=pra-001
```

Respuesta esperada parcial:

```json
{
  "disponible": true,
  "medicoId": "med-001",
  "duracionPrestacion": 30,
  "duracionTurno": 40,
  "modulosRequeridos": 2,
  "turnosCercanos": []
}
```

## GET /turnos/disponibles

Busca slots disponibles de forma general. Devuelve una lista simple de turnos generados. Para ver cobertura, costo base, monto a abonar, ordenamiento y paginacion por paciente, usar `GET /pacientes/:id/turnos/disponibles`.

Filtros soportados:

```text
medicoId
especialidadId
practicaId
tipoPrestacion
sedeId
fechaDesde
fechaHasta
duracionTurnoEnMins
```

Por medico y especialidad:

```http
GET {{baseUrl}}/turnos/disponibles?medicoId=med-001&especialidadId=esp-001
```

Por especialidad, sede y rango de fechas:

```http
GET {{baseUrl}}/turnos/disponibles?especialidadId=esp-001&sedeId=sede-001&fechaDesde=2026-05-25T00:00:00.000-03:00&fechaHasta=2026-05-25T23:59:00.000-03:00
```

Por practica:

```http
GET {{baseUrl}}/turnos/disponibles?tipoPrestacion=practica&practicaId=pra-001&sedeId=sede-002
```

Con duracion manual, si no se usa una prestacion existente:

```http
GET {{baseUrl}}/turnos/disponibles?medicoId=med-001&duracionTurnoEnMins=30
```

## POST /turnos

Crea un turno directamente, validando disponibilidad.

```http
POST {{baseUrl}}/turnos
Content-Type: application/json
```

Body:

```json
{
  "id": "tur-manual-001",
  "medico": {
    "id": "med-001"
  },
  "paciente": {
    "id": "pac-001",
    "nombre": "Juan Lopez"
  },
  "fechaHora": "2026-05-25T09:20:00.000-03:00",
  "sede": {
    "id": "sede-001",
    "nombre": "Sede Central",
    "direccion": "Av. Siempre Viva 123"
  },
  "especialidad": {
    "id": "esp-001",
    "nombre": "Cardiologia",
    "duracionTurnoEnMins": 30,
    "costoConsulta": 5000
  },
  "estado": "CONFIRMADO",
  "historialEstados": [],
  "costo": 5000
}
```

## POST /turnos/solicitudes

Solicita un turno y devuelve el turno creado junto con el analisis de disponibilidad.

```http
POST {{baseUrl}}/turnos/solicitudes
Content-Type: application/json
```

Body:

```json
{
  "id": "tur-solicitud-001",
  "medico": {
    "id": "med-001"
  },
  "paciente": {
    "id": "pac-001",
    "nombre": "Juan Lopez"
  },
  "fechaHora": "2026-05-25T10:20:00.000-03:00",
  "sede": {
    "id": "sede-001",
    "nombre": "Sede Central",
    "direccion": "Av. Siempre Viva 123"
  },
  "especialidad": {
    "id": "esp-001",
    "nombre": "Cardiologia",
    "duracionTurnoEnMins": 30,
    "costoConsulta": 5000
  },
  "estado": "RESERVADO",
  "historialEstados": [],
  "costo": 5000
}
```

## PATCH /turnos/:id

Actualiza un turno.

```http
PATCH {{baseUrl}}/turnos/tur-manual-001
Content-Type: application/json
```

Body:

```json
{
  "fechaHora": "2026-05-25T11:00:00.000-03:00",
  "sede": {
    "id": "sede-002",
    "nombre": "Sede Norte",
    "direccion": "Calle Falsa 456"
  },
  "costo": 6500
}
```

Marcar como realizado:

```http
PATCH {{baseUrl}}/turnos/tur-manual-001
Content-Type: application/json
```

Body:

```json
{
  "estado": "REALIZADO",
  "usuario": {
    "id": "med-001",
    "nombre": "Ana Gomez"
  }
}
```

Cancelar:

```http
PATCH {{baseUrl}}/turnos/tur-manual-001
Content-Type: application/json
```

Body:

```json
{
  "estado": "CANCELADO",
  "usuario": {
    "id": "usr-001",
    "nombre": "Recepcionista"
  },
  "motivo": "El paciente cancelo"
}
```

## DELETE /turnos/:id

Elimina un turno existente.

```http
DELETE {{baseUrl}}/turnos/tur-manual-001
```

Status esperado:

```text
204 No Content
```
