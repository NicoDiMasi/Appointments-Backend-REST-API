# Sweet Medical - Entrega 2

## Descripcion General

**Sweet Medical** es una API REST desarrollada en **Node.js** y **Express** para la gestion de turnos medicos.

El sistema permite administrar:

- Medicos.
- Pacientes.
- Servicios medicos.
- Disponibilidades horarias.
- Turnos.
- Obras sociales.
- Notificaciones.

En esta segunda entrega se evoluciono el backend respecto de la Entrega 1, incorporando persistencia real en una base de datos documental NoSQL, mayor cobertura funcional de los requerimientos y documentacion de la API.

---

## Evolucion Respecto De La Entrega 1

En la Entrega 1 el proyecto se encontraba orientado principalmente a construir la base funcional del backend, definiendo los primeros modulos, rutas y logica inicial para trabajar con medicos, pacientes y turnos.

Para la Entrega 2, el sistema evoluciono hacia una solucion mas completa, incorporando persistencia real con **MongoDB** y **Mongoose**, una mejor separacion por capas y una mayor cobertura de los flujos funcionales requeridos.

Ademas, se completaron entidades y modulos que en la primera entrega todavia no estaban desarrollados en su totalidad, permitiendo representar mejor el dominio del problema. Se incorporaron o consolidaron modulos como obras sociales, notificaciones, servicios medicos, disponibilidades y busqueda de turnos.

Tambien se actualizo la logica relacionada con la asignacion de disponibilidad de los medicos y la generacion/reserva de turnos. A partir de esta mejora, la disponibilidad horaria del profesional impacta directamente en los turnos que pueden ofrecerse, reservarse o modificarse dentro del sistema.

### Principales Avances

- Se reemplazo la persistencia en memoria por una base de datos documental NoSQL.
- Se reforzo la organizacion modular del backend.
- Se consolido la separacion entre routers, controllers, services, repositories, schemas y dominio.
- Se completaron entidades y modulos que faltaban o estaban parcialmente desarrollados.
- Se actualizo la logica de disponibilidad de medicos.
- Se mejoro la logica de generacion, reserva, modificacion y cancelacion de turnos.
- Se agregaron funcionalidades vinculadas a servicios medicos, busqueda de turnos, cobertura de obras sociales y notificaciones.
- Se incorporaron filtros, paginacion y ordenamiento en la busqueda de turnos disponibles.
- Se sumaron tests unitarios para validar reglas de negocio y comportamiento de servicios.
- Se documento la API mediante Swagger para facilitar la comprension y prueba de los endpoints.

Esta evolucion permitio pasar de una primera version funcional del backend a una API mas completa, persistente y cercana al comportamiento esperado de una plataforma real de gestion de turnos medicos.

---

## Objetivo De La Entrega 2

El objetivo principal de esta entrega fue completar el backend de la aplicacion, integrando la logica de negocio con persistencia en base de datos y exponiendo endpoints REST que permitan cubrir los principales flujos funcionales del sistema.

### Puntos Trabajados

- Organizacion del backend por modulos.
- Separacion de responsabilidades por capas.
- Persistencia documental con MongoDB y Mongoose.
- Gestion de medicos, pacientes, turnos, servicios y obras sociales.
- Gestion de disponibilidades horarias.
- Busqueda de turnos disponibles con filtros.
- Calculo de cobertura y costo estimado para el paciente.
- Paginacion y ordenamiento de resultados.
- Generacion y visualizacion de notificaciones.
- Tests unitarios de dominio y servicios.
- Documentacion de la API mediante Swagger.

---

## Arquitectura Del Proyecto

El backend se encuentra organizado de forma modular, separando cada parte del dominio en carpetas independientes.

### Flujo General

```text
Request HTTP
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
MongoDB / Dominio
```

### Responsabilidad De Cada Capa

| Capa | Responsabilidad |
| --- | --- |
| Routes | Definen los endpoints disponibles. |
| Controllers | Reciben la request, extraen datos y devuelven respuestas HTTP. |
| Services | Concentran la logica de negocio y las validaciones principales. |
| Repositories | Encapsulan el acceso a datos. |
| Schemas | Definen la estructura de los documentos persistidos en MongoDB. |
| Domain | Modela entidades y comportamientos propios del negocio. |
| Errors | Centraliza errores especificos de cada modulo. |

### Modulos Principales

- `medicos`
- `pacientes`
- `turnos`
- `obrasSociales`
- `notificaciones`
- `health`

---

## Persistencia

A diferencia de la primera entrega, donde parte de la informacion podia manejarse en memoria, en esta iteracion se integro persistencia real mediante una base de datos NoSQL documental.

### Tecnologias Utilizadas

- **MongoDB** como base de datos documental.
- **Mongoose** como ODM para definir schemas, modelos y consultas.

### Entidades Persistidas

Se modelaron documentos para las principales entidades del sistema:

- Medicos.
- Pacientes.
- Turnos.
- Obras sociales.
- Notificaciones.

La persistencia se integra con la logica de negocio a traves de repositorios, evitando que los servicios dependan directamente de la base de datos.

---

## Funcionalidades Implementadas

## Gestion De Medicos

El sistema permite administrar medicos y sus datos principales.

Ademas, cada medico puede tener asociados servicios, especialidades, practicas y disponibilidades horarias.

### Funcionalidades Principales

- Alta y consulta de medicos.
- Administracion de servicios ofrecidos.
- Definicion y modificacion de disponibilidades.
- Consulta de disponibilidad por especialidad o practica.
- Gestion de turnos vinculados al medico.

---

## Gestion De Pacientes

El sistema permite administrar pacientes y vincularlos con turnos, historial y obra social.

### Funcionalidades Principales

- Alta, consulta, modificacion y baja de pacientes.
- Reserva de turnos.
- Cancelacion de turnos con motivo.
- Consulta de historial personal.
- Cambio de turno por otro disponible con el mismo profesional.

---

## Gestion De Servicios

Los medicos pueden administrar los servicios que ofrecen, entendiendo como servicios a las especialidades o practicas disponibles para la atencion.

### Operaciones Contempladas

- Alta de servicios.
- Modificacion de servicios.
- Baja de servicios.

---

## Gestion De Disponibilidades

La disponibilidad horaria de los medicos se utiliza como base para la generacion y busqueda de turnos.

### El Sistema Contempla

- Definicion de dias y horarios de atencion.
- Generacion de turnos disponibles a partir de la disponibilidad.
- Validacion de superposicion de horarios.
- Organizacion de turnos en modulos de tiempo.
- Impacto de los cambios de disponibilidad sobre nuevos turnos.

Los turnos ya existentes se preservan, mientras que las modificaciones de disponibilidad afectan la generacion de futuros turnos.

---

## Gestion De Turnos

La gestion de turnos contempla el ciclo de vida principal del turno medico.

### Funcionalidades Implementadas

- Reserva de turno por parte de un paciente.
- Cancelacion de turno con al menos una hora de anticipacion.
- Cancelacion indicando motivo.
- Cambio de turno por otro disponible.
- Modificacion de turno por parte del medico.
- Marcado de turno como realizado.
- Consulta de historial de turnos.
- Consulta de disponibilidad.

Tambien se contemplan reglas de negocio como validacion de horarios, disponibilidad del profesional, estado del turno y generacion de notificaciones asociadas.

---

## Busqueda De Turnos

Uno de los puntos centrales de esta entrega es la busqueda de turnos disponibles.

### Filtros Disponibles

- Profesional.
- Especialidad.
- Practica.
- Sede de atencion.
- Rango de fechas.

### Informacion Incluida En Los Resultados

- Profesional.
- Servicio, especialidad o practica.
- Fecha y hora.
- Sede.
- Costo estimado.
- Estado de cobertura de la prestacion.

### Estados De Cobertura

- Cubierta totalmente.
- Cubierta parcialmente.
- No cubierta.

### Mejoras De Consulta

- Paginacion de resultados.
- Ordenamiento por fecha.
- Ordenamiento por costo.
- Orden ascendente y descendente.

---

## Obras Sociales Y Calculo De Cobertura

El modulo de obras sociales permite determinar si una prestacion se encuentra cubierta para un paciente y calcular el monto estimado que debera abonar.

### El Sistema Contempla

- Obras sociales.
- Planes.
- Prestaciones cubiertas.
- Porcentaje o tipo de cobertura.
- Calculo del costo final para el paciente.

Esto permite que la busqueda de turnos no solo muestre disponibilidad, sino tambien informacion util para la toma de decision del paciente.

---

## Notificaciones

La plataforma incorpora un sistema de notificaciones internas para informar eventos relevantes a los usuarios.

### Eventos Que Generan Notificaciones

- Reserva de turno.
- Cancelacion de turno.
- Modificacion de turno.
- Propuesta de cambio de turno por parte del medico.

### Operaciones Disponibles

- Consultar notificaciones no leidas.
- Consultar notificaciones leidas.
- Marcar una notificacion como leida.

Las notificaciones se implementan de forma desacoplada del flujo principal, evitando que un error en la notificacion bloquee la operacion principal del turno.

---

## Tests Unitarios

La entrega incluye tests unitarios sobre logica de dominio y servicios.

Los tests buscan validar reglas de negocio relevantes, no solamente casos triviales.

### Comportamientos Testeados

- Creacion y validacion de entidades.
- Reglas vinculadas a turnos.
- Validaciones de disponibilidad.
- Comportamiento de servicios.
- Casos de error esperados.
- Operaciones principales del dominio.

### Ejecucion

```bash
npm test
```

---

## Documentacion De La API

La API se encuentra documentada mediante **Swagger**, permitiendo visualizar y comprender los endpoints disponibles.

Desde Swagger se puede consultar:

- Endpoints implementados.
- Metodos HTTP utilizados.
- Parametros requeridos.
- Cuerpos de request.
- Respuestas esperadas.
- Organizacion general de la API.

Esto facilita la prueba de los endpoints y permite comprender el contrato expuesto por el backend.

---

## Ejecucion Del Proyecto

### Instalar Dependencias

```bash
npm install
```

### Levantar El Servidor

```bash
npm run dev
```

### Ejecutar Tests

```bash
npm test
```

---

## Aspectos Destacados Para La Exposicion

### Lineamientos Sugeridos

1. Presentación general de la solución y evolución respecto de la Entrega 1
2. Explicación breve de la arquitectura y del modelo de persistencia
3. Demo de gestión de servicios
4. Demo de disponibilidades
5. Demo de turnos, incluyendo al menos algunos casos de negocio relevantes
6. Demo de búsqueda de turnos con filtros, cobertura, costo, paginación y ordenamiento
7. Demo de notificaciones
8. Presentación de los tests unitarios
9. Presentación breve de la documentación Swagger


---