# Medicos

Usar `{{baseUrl}}` como `http://localhost:3000`.

## CRUD basico

### GET /medicos

Lista los medicos cargados.

```http
GET {{baseUrl}}/medicos
```

### GET /medicos/:medicoId

Busca un medico por ID.

```http
GET {{baseUrl}}/medicos/med-001
```

### POST /medicos

Crea un medico.

```http
POST {{baseUrl}}/medicos
Content-Type: application/json
```

Body:

```json
{
  "id": "med-test-001",
  "matricula": "MP-TEST",
  "nombre": "Medico Test",
  "especialidades": [],
  "practicas": [],
  "sedes": [],
  "disponibilidades": []
}
```

## Servicios

### GET /medicos/:medicoId/servicios

Lista especialidades y practicas ofrecidas por el medico.

```http
GET {{baseUrl}}/medicos/med-001/servicios
```

### POST /medicos/:medicoId/servicios

Agrega una especialidad.

```http
POST {{baseUrl}}/medicos/med-001/servicios
Content-Type: application/json
```

Body:

```json
{
  "tipo": "especialidad",
  "id": "esp-test-001",
  "nombre": "Dermatologia",
  "duracionTurnoEnMins": 30,
  "costoConsulta": 5500
}
```

Agrega una practica.

```http
POST {{baseUrl}}/medicos/med-001/servicios
Content-Type: application/json
```

Body:

```json
{
  "tipo": "practica",
  "id": "pra-test-001",
  "codigo": "RX-TORAX",
  "nombre": "Radiografia de torax",
  "duracionTurnoEnMins": 40,
  "costo": 8000
}
```

### PATCH /medicos/:medicoId/servicios/:tipo/:servicioId

Actualiza una practica.

```http
PATCH {{baseUrl}}/medicos/med-001/servicios/practica/pra-test-001
Content-Type: application/json
```

Body:

```json
{
  "duracionTurnoEnMins": 60,
  "costo": 9000
}
```

### DELETE /medicos/:medicoId/servicios/:tipo/:servicioId

Elimina un servicio.

```http
DELETE {{baseUrl}}/medicos/med-001/servicios/practica/pra-test-001
```

Status esperado:

```text
204 No Content
```

## Disponibilidades

### GET /medicos/:medicoId/disponibilidades

```http
GET {{baseUrl}}/medicos/med-001/disponibilidades
```

### POST /medicos/:medicoId/disponibilidades

Agrega disponibilidad. Usar un dia que no exista para ese medico.

```http
POST {{baseUrl}}/medicos/med-001/disponibilidades
Content-Type: application/json
```

Body:

```json
{
  "diaSemana": "MARTES",
  "horaDesde": "10:00",
  "horaHasta": "12:00"
}
```

### PATCH /medicos/:medicoId/disponibilidades/:diaSemana

```http
PATCH {{baseUrl}}/medicos/med-001/disponibilidades/MARTES
Content-Type: application/json
```

Body:

```json
{
  "horaDesde": "11:00",
  "horaHasta": "13:00"
}
```

### DELETE /medicos/:medicoId/disponibilidades/:diaSemana

```http
DELETE {{baseUrl}}/medicos/med-001/disponibilidades/MARTES
```

Status esperado:

```text
204 No Content
```

## Disponibilidad y turnos vistos por medico

### GET /medicos/:medicoId/disponibilidades-turnos

Consulta si un medico esta disponible para una prestacion en una fecha.

```http
GET {{baseUrl}}/medicos/med-001/disponibilidades-turnos?fechaHora=2026-05-25T09:20:00.000-03:00&especialidadId=esp-001
```

Para practica:

```http
GET {{baseUrl}}/medicos/med-001/disponibilidades-turnos?fechaHora=2026-05-25T09:20:00.000-03:00&tipoPrestacion=practica&practicaId=pra-001
```

### GET /medicos/:medicoId/pacientes/:pacienteId/turnos

```http
GET {{baseUrl}}/medicos/med-001/pacientes/pac-001/turnos
```

### PATCH /medicos/:medicoId/turnos/:turnoId

Cancela un turno desde medico.

```http
PATCH {{baseUrl}}/medicos/med-001/turnos/tur-pac-001
Content-Type: application/json
```

Body:

```json
{
  "estado": "CANCELADO",
  "motivo": "El medico no puede atender"
}
```
