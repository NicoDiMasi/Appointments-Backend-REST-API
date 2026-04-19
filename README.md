# Sweet Medical

Plataforma web de gestión de turnos médicos.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `http://localhost:3000/` | Bienvenida |
| GET | `http://localhost:3000/health` | Estado de salud del sistema |

### Ejemplo de respuesta `/health`

```json
{
  "status": "UP",
  "timestamp": "2026-04-19T00:36:38.609Z",
  "uptime": 2.12
}
```
