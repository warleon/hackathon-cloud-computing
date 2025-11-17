# AlertaUTEC
Plataforma serverless para reportar, monitorear y gestionar incidentes dentro del campo UTEC

## Índice
- Descripción General
- Objetivos del proyecto
- Implementaciones

# Descripción General
AlertaUTEC es una plataforma serverless diseñada para reportar, visualizar y gestionar incidentes ocurridos dentro del campo universitario. Donde los estudianetes puedan reportar y visualizar sus reportes, para luego el personal administrativo y autoridades universitarias gestionar, atenter y solucionar sus incidentes reportados, todo en tiempo real.

# Objetivos del proyecto
Desarrollar una plataforma en la nuba que permita realizar el gestionamiento de los reportes en tiempo real, garantizando un proceso seguro, escalable y fácil en su uso para los usuarios.

## Objetivos Secundarios
- Diseñar de una arquitectura 100% serverless.
- Implementar comunicación en tiempo real con WebSockets.
- Orquestar procesos automáticos con Apache Airflow.
- Garantizar fluidez y seguridad a los usuarios, asegurando autenticaciones, control de roles y trazabilidad para cada incidente.
- Proveer herramientas de análisis y visualización.

# Implementaciones
## Lambda
Se crearon las sigueintes funciones
- **onConnect**: Registrar conexiones WebSocket.
- **onDisconnect**: Eliminar conexiones activas.
- **sendMessage**: Enviar notificaciones en tiempo real.

## API Gateaway - WebSockets

## Base de datos (DynamoDB)
Se crearon las siguientes tablas:
- Incidentes.
- WebsocketConnections

## API rest

## Frontend
- Página de login.
- Página para crear reportes.
- Dashboard para visualizar datos de incidentes y usuarios en tiempo real.
- Conexión WebSocket.

## Airflow
