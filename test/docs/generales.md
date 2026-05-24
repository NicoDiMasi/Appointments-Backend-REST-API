# Generales

Usar `{{baseUrl}}` como `http://localhost:3000`.

## GET /

Verifica que la API responda.

```http
GET {{baseUrl}}/
```

## GET /health

Verifica estado, timestamp y uptime.

```http
GET {{baseUrl}}/health
```

Respuesta esperada parcial:

```json
{
  "status": "UP",
  "timestamp": "2026-05-24T12:00:00.000-03:00",
  "uptime": 10
}
```

