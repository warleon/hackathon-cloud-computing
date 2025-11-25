# Despliegue

link Amplify: https://main.d3lqi7rn9fvv2x.amplifyapp.com/

Credenciales:

```
UTEC
0bvyd8h2gj@utec.edu.pe
$zp[EnDk]5kQS0_W
```

Paths:

```
/
/report
/reports
/admin/users
/admin/users/create
```

`/reports` y `/admin/users` tiene un bug en el frontend, probablemente un loop de updates infinitos en react causado por las listas, que no se corrigio por falta de tiempo.
Esto causa que esas paginas no sean interactuables. Para navegar a otras paginas desde estas paginas bugeadas se puede actualizar la URL en el browser directamente.

# AlertaUTEC

Plataforma serverless para reportar, monitorear y gestionar incidentes dentro del campo UTEC

## Índice

- Descripción General
- Objetivos del proyecto
- Implementaciones

# Descripción General

AlertaUTEC es una plataforma serverless diseñada para reportar, visualizar y gestionar incidentes ocurridos dentro del campo universitario. Donde los estudianetes puedan reportar y visualizar sus reportes, para luego el personal administrativo y autoridades universitarias gestionar, atenter y solucionar sus incidentes reportados, todo en tiempo real.

# Objetivos del proyecto

Desarrollar una plataforma en la nube que permita gestionar incidentes de manera eficiente, garantizando un sistema seguro, escalable y sencillo de usar para todos los usuarios.

## Objetivos Secundarios

- Diseñar una arquitectura 100% serverless.
- Automatizar procesos mediante Apache Airflow.
- Garantizar seguridad y fluidez mediante autenticación, control de roles y trazabilidad.
- Proveer herramientas de análisis y visualización sobre los incidentes.
- Facilitar el acceso desde cualquier dispositivo conectado a internet.

# Implementaciones

## Lambda

Se crearon funciones Lambda:

- **crearIncidente**: Registrar un incidente en la base de datos.
- **listarIncidentes**: Obtener la lista de incidentes para el dashboard.
- **actualizarIncidente**: Cambiar el estado o información del incidente.
- **procesosInternos**: Funciones auxiliares para tareas automatizadas o validaciones.

## API Gateaway

Se configuró un API REST para exponer los endpoints que permiten:

- Registrar incidentes.
- Consultar incidentes.
- Actualizar inidentes.
- Gestionar usuarios o roles.

## Base de datos (DynamoDB)

Se creó una tabla principal:

- **Incidentes**
  - ID de incidente
  - Tipo
  - Ubicación
  - Descripción
  - Nivel de urgencia
  - Estado (pendiente, en atención, resuelto)
  - Usuario que reporta
  - Fechas registro.

## Frontend

Se desarrolló una interfaz web con las siguientes páginas:

- **Página de Login**
  Autenticación de estudiantes, administrativo y autoridades.

- **Página para crear reportes**  
  Formulario de registro de incidentes con tipo, ubicación, descripción y urgencia.

- **Dashboard administrativo**  
  Visualización de incidentes con opciones de filtrado y actualización del estado.

## Airflow

Se utiliza Apache Airflow para la orquestación de procesos automáticos, como:

- Clasificación automática de incidentes.
- Envío de alertas a áreas responsables.
- Generación periódica de reportes estadísticos.
- Procesamiento batch de datos o limpieza de registros.
