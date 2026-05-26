# Notificaciones

Usar `{{baseUrl}}` como `http://localhost:3000`.

Las notificaciones se generan de forma asincronica cuando se reservan, cancelan o modifican turnos. Los recordatorios se programan desde el servidor para turnos del dia siguiente.

## GET /notificaciones/usuarios/:usuarioId

Lista notificaciones no leidas de un usuario. El `usuarioId` puede ser de medico o paciente.

```http
GET {{baseUrl}}/notificaciones/usuarios/med-001
```

Tambien se puede pedir explicitamente no leidas:

```http
GET {{baseUrl}}/notificaciones/usuarios/med-001?leida=false
```

## GET /notificaciones/usuarios/:usuarioId?leida=true

Lista notificaciones leidas.

```http
GET {{baseUrl}}/notificaciones/usuarios/pac-001?leida=true
```

Respuesta esperada parcial:

```json
[
  {
    "_id": "notif-xxx",
    "destinatarioId": "med-001",
    "destinatarioTipo": "medico",
    "remitenteId": "pac-001",
    "remitenteTipo": "paciente",
    "mensaje": "El paciente Juan Lopez reservo un turno de Cardiologia.",
    "tipo": "RESERVA_TURNO",
    "leida": false,
    "fechaHoraLeida": null
  }
]
```

## PATCH /notificaciones/:id/leida

Marca una notificacion como leida.

```http
PATCH {{baseUrl}}/notificaciones/notif-xxx/leida
```

Respuesta esperada parcial:

```json
{
  "_id": "notif-xxx",
  "leida": true,
  "fechaHoraLeida": "2026-05-26T12:00:00.000Z"
}
```

## Flujo sugerido

1. Reservar un turno con `POST /pacientes/pac-001/turnos`.
2. Consultar `GET /notificaciones/usuarios/med-001`.
3. Guardar el `_id` de una notificacion.
4. Marcarla como leida con `PATCH /notificaciones/:id/leida`.
5. Verificarla con `GET /notificaciones/usuarios/med-001?leida=true`.

## Tipos de notificacion

```text
RESERVA_TURNO
TURNO_ACEPTADO
CANCELACION_PACIENTE
CANCELACION_MEDICO
MODIFICACION_TURNO
RECORDATORIO
```
