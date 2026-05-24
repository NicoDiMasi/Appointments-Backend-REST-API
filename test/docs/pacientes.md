# Pacientes

Usar `{{baseUrl}}` como `http://localhost:3000`.

## CRUD de pacientes

### GET /pacientes

```http
GET {{baseUrl}}/pacientes
```

### GET /pacientes/:id

```http
GET {{baseUrl}}/pacientes/pac-001
```

### POST /pacientes

```http
POST {{baseUrl}}/pacientes
Content-Type: application/json
```

Body:

```json
{
  "id": "pac-test-001",
  "usuario": {
    "id": "usr-test-001",
    "email": "test@example.com"
  },
  "dni": "40111222",
  "nombre": "Paciente Test",
  "obraSocial": {
    "id": "os-001",
    "nombre": "OSDE"
  },
  "plan": {
    "id": "plan-210",
    "nombre": "210"
  }
}
```

### PATCH /pacientes/:id

```http
PATCH {{baseUrl}}/pacientes/pac-test-001
Content-Type: application/json
```

Body:

```json
{
  "nombre": "Paciente Test Actualizado",
  "plan": {
    "id": "plan-smg20",
    "nombre": "SMG20"
  }
}
```

### DELETE /pacientes/:id

```http
DELETE {{baseUrl}}/pacientes/pac-test-001
```

Status esperado:

```text
204 No Content
```

## Turnos de pacientes

### POST /pacientes/:id/turnos

Reserva un turno para un paciente, validando disponibilidad.

```http
POST {{baseUrl}}/pacientes/pac-001/turnos
Content-Type: application/json
```

Body:

```json
{
  "id": "tur-pac-001",
  "medicoId": "med-001",
  "especialidadId": "esp-001",
  "fechaHora": "2026-05-25T09:20:00.000-03:00",
  "sede": {
    "id": "sede-001",
    "nombre": "Sede Central",
    "direccion": "Av. Siempre Viva 123"
  }
}
```

### GET /pacientes/:id/turnos

Consulta historial de turnos del paciente.

```http
GET {{baseUrl}}/pacientes/pac-001/turnos
```

### PATCH /pacientes/:id/turnos/:turnoId/cancelacion

Cancela un turno con motivo.

```http
PATCH {{baseUrl}}/pacientes/pac-001/turnos/tur-pac-001/cancelacion
Content-Type: application/json
```

Body:

```json
{
  "motivo": "El paciente no puede asistir"
}
```

### PATCH /pacientes/:id/turnos/:turnoId/cambio

Cambia un turno a otro slot disponible del mismo profesional.

```http
PATCH {{baseUrl}}/pacientes/pac-001/turnos/tur-pac-001/cambio
Content-Type: application/json
```

Body:

```json
{
  "fechaHora": "2026-05-25T10:20:00.000-03:00",
  "sede": {
    "id": "sede-001",
    "nombre": "Sede Central",
    "direccion": "Av. Siempre Viva 123"
  }
}
```

## Flujo sugerido

1. Buscar slots:

```http
GET {{baseUrl}}/turnos/disponibles?medicoId=med-001&especialidadId=esp-001&sedeId=sede-001
```

2. Reservar con `POST /pacientes/pac-001/turnos`.
3. Consultar historial con `GET /pacientes/pac-001/turnos`.
4. Cambiar o cancelar el turno reservado.

