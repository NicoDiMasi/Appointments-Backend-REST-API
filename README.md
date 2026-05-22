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
| GET | `/turnos` | Lista todos los turnos |
| POST | `/turnos` | Crea un nuevo turno |
| GET | `/turnos/:id` | Busca un turno por ID |
| PATCH | `/turnos/:id` | Actualiza un turno existente. Para cancelarlo, enviar `estado: "CANCELADO"` |
| DELETE | `/turnos/:id` | Elimina un turno |


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
│       │   └── router.js
│       │
│       └── turnos/
│           ├── turno.router.js
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

### Ramas principales

- `main`: rama principal del proyecto.
- `feature/setup-health`: configuración inicial del servidor Express y endpoint `/health`.
- `feature/crear-disponibilidad-medico`: creación de entidades, repositorio y servicio para disponibilidades médicas.
- `feature/listar-disponibilidades-medico`: funcionalidad para listar disponibilidades de un médico.
- `feature/actualizar-disponibilidad-medico`: funcionalidad para actualizar disponibilidades médicas.
- `feature/eliminar-disponibilidad-medico`: funcionalidad para eliminar disponibilidades médicas.
- `feature/turnos`: desarrollo del módulo de turnos, incluyendo dominio, repositorio, servicio, controller y tests.
- `rescate-turnos`: rama auxiliar utilizada para recuperar e integrar lógica relacionada con generación de turnos.
- `Entrega-1`: rama de integración final utilizada para consolidar las funcionalidades desarrolladas.

### Diagrama simplificado

```text
main
│
├── feature/setup-health
│   └── merge a main
│
├── feature/crear-disponibilidad-medico
├── feature/listar-disponibilidades-medico
├── feature/actualizar-disponibilidad-medico
├── feature/eliminar-disponibilidad-medico
│
├── feature/turnos
│   ├── rescate-turnos
│   └── TurnoService.test
│
└── Entrega-1
    ├── merge de funcionalidades de médicos
    ├── merge de feature/turnos
    ├── conexión del router de turnos en app.js
    └── actualización del README
```
---

## Historial relevante

Del historial de Git se destacan los siguientes commits:

```text
d179f90 configuración inicial de node + express
e5421e4 agregada estructura base del proyecto
448e658 merge con feature/setup-health
54af886 creación de disponibilidades médicas
d67f526 listado de disponibilidades médicas
91b15a1 actualización de disponibilidades médicas
50d46d7 eliminación de disponibilidades médicas
0d73354 integración de médicos y creación inicial de turnos
974b382 esqueleto de repository y service de turnos
278e66c CRUD y baja de turno
b2f6e6b TurnoRepository con mocks
b0b11b5 merge de rescate-turnos en feature/turnos
1aa7438 controller y métodos básicos de turnos
15c27aa TurnoService.test
fde887b merge de turnos y médicos en Entrega-1
cbeab34 modificación de app.js con router de Turno
8429caf actualización del README
```

---

## Guia rapida para probar la API

Para levantar el servidor:

```bash
npm run dev
```

La API queda disponible en:

```text
http://localhost:3000
```

### Datos cargados

Medicos cargados en memoria:

| ID | Nombre | Especialidades | Disponibilidades |
|----|--------|----------------|------------------|
| `med-001` | Ana Gomez | Cardiologia, Clinica Medica | LUNES 08:00-12:00, MIERCOLES 14:00-18:00, VIERNES 09:00-13:00 |
| `med-002` | Carlos Perez | Neurologia | MARTES 07:00-11:00, JUEVES 15:00-19:00, SABADO 08:00-12:00 |
| `med-003` | Laura Martinez | Pediatria | LUNES 10:00-14:00, MIERCOLES 16:00-20:00, VIERNES 08:30-12:30 |

Turnos cargados en memoria:

| ID | Medico | Estado | Horario |
|----|--------|--------|---------|
| `tur-001` | `med-001` | DISPONIBLE | Proximo LUNES 08:30 |
| `tur-002` | `med-002` | CONFIRMADO | Proximo MARTES 08:00 |
| `tur-003` | `med-003` | DISPONIBLE | Proximo VIERNES 09:00 |

Las fechas de los turnos mock se calculan automaticamente hacia la proxima ocurrencia de ese dia de la semana.

### Health check

```bash
curl http://localhost:3000/health
```

### Turnos

Listar turnos:

```bash
curl http://localhost:3000/turnos
```

Buscar un turno por ID:

```bash
curl http://localhost:3000/turnos/tur-001
```

Dar de alta un turno:

```bash
curl -X POST http://localhost:3000/turnos \
  -H "Content-Type: application/json" \
  -d '{
    "id": "tur-004",
    "medico": {
      "id": "med-001",
      "matricula": "MP-1234",
      "nombre": "Ana Gomez",
      "especialidades": [
        {
          "id": "esp-001",
          "nombre": "Cardiologia",
          "duracionTurnoEnMins": 30,
          "costoConsulta": 5000
        }
      ],
      "disponibilidades": [
        { "diaSemana": "LUNES", "horaDesde": "08:00", "horaHasta": "12:00" },
        { "diaSemana": "MIERCOLES", "horaDesde": "14:00", "horaHasta": "18:00" },
        { "diaSemana": "VIERNES", "horaDesde": "09:00", "horaHasta": "13:00" }
      ]
    },
    "paciente": {
      "id": "pac-004",
      "nombre": "Paciente Demo",
      "dni": "30123456"
    },
    "fechaHora": "2026-05-25T09:30:00.000-03:00",
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
    "practica": null,
    "estado": "CONFIRMADO",
    "historialEstados": [],
    "costo": 5000
  }'
```

El alta valida que el medico tenga disponibilidad para ese dia y horario, y que no haya otro turno superpuesto para el mismo medico. Si se usa este ejemplo despues del 25 de mayo de 2026, cambiar `fechaHora` por un lunes futuro dentro del rango 08:00-12:00.

Actualizar un turno:

```bash
curl -X PATCH http://localhost:3000/turnos/tur-001 \
  -H "Content-Type: application/json" \
  -d '{
    "fechaHora": "2026-05-25T10:30:00.000-03:00",
    "costo": 6500
  }'
```

Dar de baja un turno:

```bash
curl -X PATCH http://localhost:3000/turnos/tur-001 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "CANCELADO",
    "usuario": {
      "id": "usr-001",
      "nombre": "Recepcionista"
    },
    "motivo": "El paciente cancelo el turno"
  }'
```

La baja solo se permite hasta una hora antes del horario del turno.

Eliminar un turno:

```bash
curl -X DELETE http://localhost:3000/turnos/tur-001
```

### Medicos y disponibilidades

Actualmente no hay endpoint para crear, listar, actualizar o eliminar medicos completos. Lo implementado para medicos es la administracion de sus disponibilidades horarias.

Listar disponibilidades de un medico:

```bash
curl http://localhost:3000/medicos/med-001/disponibilidades
```

Agregar disponibilidad:

```bash
curl -X POST http://localhost:3000/medicos/med-001/disponibilidades \
  -H "Content-Type: application/json" \
  -d '{
    "diaSemana": "MARTES",
    "horaDesde": "13:00",
    "horaHasta": "16:00"
  }'
```

Actualizar disponibilidad:

```bash
curl -X PATCH http://localhost:3000/medicos/med-001/disponibilidades/MARTES \
  -H "Content-Type: application/json" \
  -d '{
    "horaDesde": "14:00",
    "horaHasta": "17:00"
  }'
```

Eliminar disponibilidad:

```bash
curl -X DELETE http://localhost:3000/medicos/med-001/disponibilidades/MARTES
```

Los dias validos son `DOMINGO`, `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES` y `SABADO`.
