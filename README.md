# Sweet Medical

Plataforma web de gestion de turnos medicos desarrollada con Node.js y Express.

El proyecto modela funcionalidades relacionadas con la administracion de medicos, disponibilidades horarias y turnos. La aplicacion esta organizada de forma modular, separando responsabilidades entre dominio, servicios, repositorios, controladores y rutas.

---

## Integrantes

- Nahuel Barbaro
- Franco Cortinez
- Nicolas Di Masi
- Luciano Bauso

---

## Requisitos previos

Antes de ejecutar el proyecto, es necesario tener instalado:

- Node.js v18 o superior
- npm
- Git

Para verificar las versiones instaladas:

```bash
node -v
npm -v
git --version
```

Instalar las dependencias:

```bash
npm install
```

---

## Ejecucion

Para iniciar la aplicacion en modo desarrollo:

```bash
npm run dev
```

La aplicacion queda disponible en:

```text
http://localhost:3000
```

El servidor se levanta desde el archivo:

```text
src/server.js
```

Este archivo importa la aplicacion configurada en:

```text
src/app.js
```

---

## Testing

El proyecto utiliza Jest para ejecutar los tests unitarios.

Para correr todos los tests:

```bash
npm test
```

El script configurado en `package.json` es:

```json
"scripts": {
  "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
  "dev": "node src/server.js"
}
```

Se utiliza `--experimental-vm-modules` porque el proyecto trabaja con ES Modules mediante:

```json
"type": "module"
```

---

## Endpoints disponibles

### Endpoints generales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `http://localhost:3000/` | Mensaje de bienvenida |
| GET | `http://localhost:3000/health` | Estado de salud del sistema |

### Ejemplo de respuesta de `/health`

```json
{
  "status": "UP",
  "timestamp": "2026-04-19T00:36:38.609Z",
  "uptime": 2.12
}
```

---

## Endpoints de medicos

El modulo de medicos esta montado en:

```text
/medicos
```

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/medicos/:medicoId/disponibilidades` | Lista las disponibilidades de un medico |
| POST | `/medicos/:medicoId/disponibilidades` | Agrega una disponibilidad a un medico |
| PATCH | `/medicos/:medicoId/disponibilidades/:diaSemana` | Actualiza una disponibilidad existente |
| DELETE | `/medicos/:medicoId/disponibilidades/:diaSemana` | Elimina una disponibilidad existente |

Ejemplo de ruta completa:

```text
http://localhost:3000/medicos/med-001/disponibilidades
```

---

## Endpoints de turnos

El proyecto contiene el router, controller, service y repository para el modulo de turnos.

Rutas definidas en el router de turnos:

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/turno` | Lista todos los turnos |
| POST | `/turno` | Crea un nuevo turno |
| GET | `/turno/:id` | Busca un turno por ID |
| PATCH | `/turno/:id` | Actualiza un turno existente |
| PATCH | `/turno/:id/baja` | Da de baja un turno |
| DELETE | `/turno/:id` | Elimina un turno |


---

## Estructura general del proyecto

```text
2026-1c-backend-grupo-05/
├── README.md
├── package.json
├── package-lock.json
├── src/
│   ├── app.js
│   ├── server.js
│   └── modules/
│       ├── health/
│       │   └── health.router.js
│       │
│       ├── medicos/
│       │   ├── controller/
│       │   │   └── MedicoController.js
│       │   ├── domain/
│       │   │   ├── DiaSemana.js
│       │   │   ├── DisponibilidadHoraria.js
│       │   │   ├── Especialidad.js
│       │   │   └── Medico.js
│       │   ├── errors/
│       │   │   └── MedicoErrors.js
│       │   ├── repository/
│       │   │   └── MedicoRepository.js
│       │   ├── service/
│       │   │   └── MedicoService.js
│       │   └── medicos.router.js
│       │
│       ├── routes/
│       │   ├── router.js
│       │   └── turnoRouter.js
│       │
│       └── turnos/
│           ├── controller/
│           │   └── turnoController.js
│           ├── domain/
│           │   ├── Agenda.js
│           │   ├── CambioEstadoTurno.js
│           │   ├── EstadoTurno.js
│           │   └── Turno.js
│           ├── errors/
│           │   └── TurnoErrors.js
│           ├── repository/
│           │   └── TurnoRepository.js
│           └── service/
│               └── TurnoService.js
│
└── test/
    ├── medicos/
    │   └── MedicoService.test.js
    ├── postman/
    │   ├── Disponibilidad Medicos.postman_collection.json
    │   └── Disponibilidad Medicos - Con validacion.postman_collection.json
    └── turnos/
        └── TurnoService.test.js
```

---

## Flujo general de funcionamiento

El flujo general de una peticion dentro del proyecto es:

```text
Cliente HTTP
    |
    v
Router
    |
    v
Controller
    |
    v
Service
    |
    v
Repository
    |
    v
Domain / Datos en memoria
```

### Explicacion del flujo

1. El cliente realiza una peticion HTTP.
2. El router recibe la peticion y la dirige al controller correspondiente.
3. El controller extrae parametros y body de la request.
4. El controller llama al service.
5. El service aplica las reglas de negocio.
6. El repository consulta o modifica los datos en memoria.
7. El resultado vuelve al controller.
8. El controller responde al cliente con un codigo HTTP y un JSON.

---

## Tests del proyecto

Los tests se encuentran dentro de la carpeta:

```text
test/
```

Actualmente existen tests para:

```text
test/medicos/MedicoService.test.js
test/turnos/TurnoService.test.js
```

### Tests de medicos

Validan principalmente el comportamiento de las disponibilidades:

- listar disponibilidades de un medico existente
- agregar una disponibilidad valida
- rechazar horarios invalidos
- rechazar disponibilidades duplicadas
- actualizar una disponibilidad existente
- eliminar una disponibilidad existente
- lanzar error si el medico no existe

### Tests de turnos

Validan principalmente el comportamiento del servicio de turnos:

- listar turnos
- buscar turnos por ID
- crear turnos validos
- rechazar turnos fuera de disponibilidad
- rechazar turnos superpuestos
- actualizar turnos
- dar de baja turnos
- eliminar turnos
- validar errores de negocio


---

## Flujo de ramas del proyecto

El repositorio utiliza un flujo de trabajo basado en ramas de funcionalidades.

A partir del historial actual del proyecto, se detectan las siguientes ramas:

### Ramas locales

```text
Entrega-1
feature/turnos
main
```

### Ramas remotas

```text
origin/Entrega-1
origin/feature/actualizar-disponibilidad-medico
origin/feature/crear-disponibilidad-medico
origin/feature/eliminar-disponibilidad-medico
origin/feature/listar-disponibilidades-medico
origin/feature/setup-health
origin/feature/turnos
origin/main
origin/rescate-turnos
```

---

## Grafico simplificado del flujo de ramas

```text
main
│
├── feature/setup-health
│       └── estructura base del proyecto y endpoint /health
│
├── feature/crear-disponibilidad-medico
│       └── entidades, repository y service para crear disponibilidades
│
├── feature/listar-disponibilidades-medico
│       └── metodo para listar disponibilidades
│
├── feature/actualizar-disponibilidad-medico
│       └── metodo para actualizar disponibilidades
│
├── feature/eliminar-disponibilidad-medico
│       └── metodo para eliminar disponibilidades y colecciones Postman
│
├── feature/turnos
│       ├── dominio de turnos y agenda
│       ├── repository de turnos
│       ├── service de turnos
│       ├── controller de turnos
│       ├── tests de TurnoService
│       └── merge de origin/rescate-turnos
│
└── Entrega-1
        ├── merge de medicos
        ├── merge de turnos
        └── ajustes en app.js
```

---

## Historial relevante

Del historial de Git se destacan los siguientes commits:

```text
cbeab34 Modifico app.js con el router de Turno
fde887b Merge turnos and medicos into Entrega-1
15c27aa TurnoService.test
5d3fd4c Logica de Agenda generarTurnosPara y generarTurnosParaPractica + arreglos Varios
26b484e Merge remote-tracking branch 'origin/feature/eliminar-disponibilidad-medico' into Entrega-1
448e658 merge con feature/setup-health
090bae7 first commit
e5421e4 agregada estructura base del proyecto
d179f90 configuracion inicial de node + express
```

---
