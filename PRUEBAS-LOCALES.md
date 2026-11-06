# Practica lista para probar

Se ejecuta la copia de este directorio, que es la abierta en IntelliJ. No se cambio el codigo de la aplicacion: se instalaron dependencias y se agrego un iniciador local.

## Abrir

- Web: http://127.0.0.1:5173
- API para Postman: http://localhost:9090/api/v1
- Administrador: `admin`, clave `Practica12!2026`.
- Cuenta sin permiso para consultar estudiantes: `estudiante_demo`, misma clave.

Las cuentas y los registros son exclusivos de una base de practica independiente en PostgreSQL, puerto 55432. No se modifico la base existente del puerto 5432. Los datos y secretos locales estan en `.practica-local/`, excluida de Git. No incluir esa carpeta en entregas ni publicarla.

## Volver a iniciar

Hacer doble clic en INICIAR-PRACTICA.cmd. Tambien se puede ejecutar desde la terminal PowerShell de IntelliJ en esta carpeta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\INICIAR-PRACTICA.ps1
```

El iniciador configura las variables necesarias para los procesos que arranca y utiliza Java 21 y Node 24 disponibles en este equipo. No presionar otra vez Run para levantar un segundo backend mientras el puerto 9090 esta ocupado. El inicio puede tardar; los registros estan en .practica-local/backend.log y frontend.log.

## Pruebas ya realizadas el 5 de noviembre de 2026

- Inicio de sesion administrador en navegador: correcto.
- Lista vacia en navegador y HTTP: correcto, 200 y [].
- Creacion de carrera y dos estudiantes ficticios en la base de practica: correcta.
- Actualizar lista y ver detalle desde el navegador: correcto.
- Solicitudes por el proxy Vite a Spring Boot: correctas.
- Sin token: 401. Token invalido: 401.
- Detalle existente: 200. ID inexistente: 404.
- Inicio de sesion de estudiante y consulta de estudiantes por HTTP: 403.

Estas solicitudes se ejecutaron por HTTP; no se afirma haberlas enviado desde la interfaz de Postman.

## Practicar con Postman

Importar Sesion12.postman_collection.json de esta carpeta. En las variables de la coleccion usar username=admin y password=Practica12!2026. Ejecutar 01 Login, 02 Listar estudiantes, 03 Detalle y 04 Sin token. El script del login guarda el token para las siguientes solicitudes. No exportar ni publicar una coleccion con contrasenas o tokens rellenados.

En el navegador, F12 > Network/Red > Fetch/XHR > Actualizar lista. Comparar estado y JSON con Postman. Para el 403, iniciar sesion en la web con estudiante_demo.

Para carga, activar Slow 3G en las herramientas del navegador y recargar. El estado vacio ya se comprobo antes de insertar registros; no es necesario borrar estos datos. Para falla de conexion, se puede activar Offline en DevTools y pulsar Actualizar lista; despues quitar Offline y reintentar.

El sistema se deja encendido al terminar esta preparacion. Reiniciar el ordenador apagara los procesos; usar el iniciador para volver a levantarlos.
