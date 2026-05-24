# Guia de pruebas manuales

Esta carpeta tiene ejemplos para probar la API con Postman, Insomnia o `curl`.

## Preparacion

1. Instalar dependencias:

```bash
npm install
```

2. Levantar el servidor:

```bash
npm.cmd run dev
```

3. Usar esta URL base:

```text
http://localhost:3000
```

En Postman o Insomnia conviene crear una variable:

```text
baseUrl = http://localhost:3000
```

Los datos son en memoria. Si reinicias el servidor, vuelven los mocks iniciales.

## Orden sugerido

1. [Generales](./generales.md): probar `/` y `/health`.
2. [Obras sociales](./obras-sociales.md): consultar obras sociales, planes y coberturas.
3. [Medicos](./medicos.md): servicios, disponibilidades y acciones del medico.
4. [Turnos](./turnos.md): busqueda de disponibilidad, creacion, solicitud, actualizacion y baja.
5. [Pacientes](./pacientes.md): CRUD de pacientes, reserva, cancelacion, historial y cambio.

## Datos utiles

Medicos:

```text
med-001 Ana Gomez
med-002 Carlos Perez
med-003 Laura Martinez
```

Pacientes:

```text
pac-001 Juan Lopez
pac-002 Maria Fernandez
pac-003 Pedro Ramirez
```

Especialidades:

```text
esp-001 Cardiologia
esp-002 Neurologia
esp-003 Pediatria
esp-004 Clinica Medica
```

Practicas:

```text
pra-001 Electrocardiograma
pra-002 Electroencefalograma
pra-003 Control pediatrico
```

Sedes:

```text
sede-001 Sede Central
sede-002 Sede Norte
sede-003 Sede Sur
```

Estados de turno:

```text
DISPONIBLE
RESERVADO
CONFIRMADO
CANCELADO
REALIZADO
```

