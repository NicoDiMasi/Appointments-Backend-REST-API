# Guia de pruebas manuales

Esta carpeta tiene ejemplos para probar la API con Postman, Insomnia o `curl`.

## Preparacion

1. Instalar dependencias:

```bash
npm install
```

2. Configurar `.env`:

```env
MONGO_URI=mongodb://localhost:27017/sweet-medical
PORT=3000
```

3. Cargar datos base:

```bash
npm run seed:mongo
```

4. Levantar el servidor:

```bash
npm run dev
```

5. Usar esta URL base:

```text
http://localhost:3000
```

En Postman o Insomnia conviene crear una variable:

```text
baseUrl = http://localhost:3000
```

La API persiste datos en MongoDB. Si queres volver al estado base de medicos, pacientes y obras sociales, ejecuta nuevamente `npm run seed:mongo`. Los turnos pueden generarse o reservarse luego mediante los endpoints de la API para realizar las pruebas funcionales.

## Orden sugerido

1. [Generales](./generales.md): probar `/`, `/health` y `/documentacion`.
2. [Obras sociales](./obras-sociales.md): consultar obras sociales, planes y coberturas.
3. [Medicos](./medicos.md): listado, alta, servicios, disponibilidades y acciones del medico.
4. [Turnos](./turnos.md): disponibilidad, creacion, solicitud, actualizacion y baja.
5. [Pacientes](./pacientes.md): CRUD de pacientes, busqueda con cobertura, reserva, cancelacion, historial y cambio.
6. [Notificaciones](./notificaciones.md): consulta de notificaciones y marcado como leida.

## Datos utiles del seed

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

Niveles de cobertura:

```text
TOTAL
PARCIAL
NO_CUBIERTA
```
