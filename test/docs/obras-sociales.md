# Obras Sociales

Usar `{{baseUrl}}` como `http://localhost:3000`.

## GET /obras-sociales

Lista obras sociales con sus planes y coberturas.

```http
GET {{baseUrl}}/obras-sociales
```

## GET /obras-sociales/:obraSocialId

Busca una obra social por ID.

```http
GET {{baseUrl}}/obras-sociales/os-001
```

## GET /obras-sociales/:obraSocialId/planes

Lista planes de una obra social.

```http
GET {{baseUrl}}/obras-sociales/os-001/planes
```

## GET /obras-sociales/:obraSocialId/planes/:planId

Busca un plan puntual.

```http
GET {{baseUrl}}/obras-sociales/os-001/planes/plan-210
```

## GET inexistente

Sirve para verificar errores.

```http
GET {{baseUrl}}/obras-sociales/os-inexistente
```

Status esperado:

```text
404 Not Found
```

