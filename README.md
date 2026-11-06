# Práctica de la sesión 12: consumo de API desde React

## Qué contiene la entrega

- `gestion-academica-web/`: la base del docente, completada con listado y detalle de estudiantes.
- `gestion-academica-backend/`: copia del repositorio Jorge22L/gestion-academica, commit `a1bf8be1a0186fe4c39b2770b15f4d5aab717032`, con correcciones de roles y credenciales de base de datos externalizadas.
- `Sesion12.postman_collection.json`: solicitudes para importar en Postman. No contiene JWT ni contraseñas guardadas.

El frontend consulta la API real. Los datos ficticios utilizados para verificar el funcionamiento se insertaron en una base PostgreSQL temporal de prueba; no están codificados en los componentes ni incluidos como registros de producción.

## Backend del grupo

El grupo utilizará la API de `Jorge22L/gestion-academica`. Esta entrega integra ese backend con el frontend de la sesión 12 y conserva la referencia al commit original para identificar las correcciones aplicadas.

## Ejecución desde cero

Requisitos: Java/JDK 21, PostgreSQL, Node.js compatible con Vite 8 y pnpm. Se verificó con el JDK 21 incluido en IntelliJ y las dependencias del lockfile. Abre dos terminales, una para cada proyecto.

### 1. Base de datos

En PostgreSQL crea una base dedicada llamada `universidad` y un usuario con permisos sobre ella, o usa una base de prueba existente. No hace falta crear tablas: el backend usa `spring.jpa.hibernate.ddl-auto=update`.

Ejemplo para ejecutar en pgAdmin con una cuenta administradora (cada CREATE por separado):

```sql
CREATE ROLE practica LOGIN PASSWORD 'elige-una-clave-local';
CREATE DATABASE universidad OWNER practica;
```

No ejecutes los CREATE si esos objetos ya existen. Usa sus credenciales o elige nombres nuevos.

### 2. Backend

Abre PowerShell en `gestion-academica-backend` y configura las variables para esa terminal:

```powershell
# Sustituye esta ruta por la carpeta de TU JDK 21 (la que contiene bin).
# Si JAVA_HOME ya apunta al JDK 21 correcto, no lo reasignes.
$env:JAVA_HOME='C:\ruta\a\tu\jdk-21'
& "$env:JAVA_HOME\bin\java.exe" -version
& "$env:JAVA_HOME\bin\javac.exe" -version
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/universidad'
$env:DB_USERNAME='practica'
$env:DB_PASSWORD='elige-una-clave-local'
$env:ADMIN_USERNAME='admin'
$env:ADMIN_PASSWORD='elige-una-clave-admin-de-8-o-mas-caracteres'
# Secreto aleatorio de 32 bytes, codificado en Base64.
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
$env:JWT_SECRET=[Convert]::ToBase64String($bytes)
.\mvnw.cmd spring-boot:run
```

La API escucha en `http://localhost:9090`. El administrador inicial solo se crea si no existe ningún usuario ADMIN. Cambiar ADMIN_PASSWORD no cambia la contraseña de un administrador ya creado. Un nuevo JWT_SECRET invalida los tokens anteriores, por lo que hay que volver a iniciar sesión.

La copia entregada ya no contiene usuario ni contraseña de PostgreSQL: exige `DB_USERNAME` y `DB_PASSWORD`. También admite las variables estándar `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`, que tienen precedencia. No guardes valores reales en archivos versionados.

### 3. Frontend

En otra terminal, dentro de `gestion-academica-web`:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Abre la URL que imprima Vite, normalmente `http://localhost:5173`. Inicia sesión con el administrador configurado arriba. Si la base está vacía, se mostrará el estado sin registros.

Para agregar datos de prueba usa las solicitudes opcionales 05 y 06 de Postman, primero la carrera y luego el estudiante. Requieren ADMIN. El campo de entrada se llama `carrera`, mientras que la respuesta devuelve `carreraId`. Pulsa «Actualizar lista» en la web después de registrar datos.

Si cambias el puerto del backend, actualiza `server.proxy['/api'].target` en `vite.config.ts`. `.env.development` conserva `VITE_API_BASE_URL=/api/v1`. Reinicia Vite al cambiar su configuración.

`pnpm build` genera `dist/`. El proxy de desarrollo de Vite no se incluye en esos archivos: un despliegue necesita un proxy propio o una URL de API y CORS adecuados. Para esta práctica usa `pnpm dev`.

## Contrato verificado en el código del backend

| Operación | Método y ruta | Parámetros/cuerpo | Respuesta y acceso |
|---|---|---|---|
| Inicio de sesión | POST `/api/v1/auth/login` | `{ "username": "...", "password": "..." }` | 200; público |
| Listado | GET `/api/v1/estudiantes` | Ninguno; no hay filtros ni paginación implementados | 200, arreglo; ADMIN o DOCENTE |
| Detalle | GET `/api/v1/estudiantes/{id}` | ID numérico en la ruta | 200, objeto; ADMIN o DOCENTE; 404 si no existe |

Respuesta de login: `accessToken: string`, `tokenType: "Bearer"`, `expiresIn: number` (segundos), `username: string`, `rol: "ADMIN" | "DOCENTE" | "ESTUDIANTE"`.

Ejemplo ilustrativo de listado (los valores dependen de la base):

```json
[
  { "id": 1, "nombre": "Ana Martínez", "correo": "ana@example.test", "edad": 22, "carreraId": 1 }
]
```

El detalle devuelve el mismo objeto sin el arreglo. El endpoint devuelve ID de carrera, no nombre de carrera, por eso la tabla identifica esa columna explícitamente. Los cinco campos se representan en `src/features/estudiantes/model/types.ts`.

Las consultas protegidas envían `Authorization: Bearer <accessToken>`. Sin token o con un token inválido se obtiene 401. Con token válido y rol insuficiente, 403. El formato de error contiene `timestamp`, `status`, `error` y `message`. El cliente limpia la sesión y la caché ante un 401 protegido; ante un 403 conserva la sesión y muestra la falta de permisos. Un 401 del login no dispara el cierre de otra sesión ni adjunta un token anterior.

## Implementación y correspondencia con la guía

1. **Contrato real:** verificado en `EstudianteController`, `EstudianteResponse`, `AuthController` y `SecurityConfig`.
2. **Cliente HTTP:** `src/shared/api/httpClient.ts` centraliza fetch, Bearer, JSON y errores. El ZIP recibido ya tenía corregidos el anidamiento y la importación de env mencionados en la guía; no fue necesario reconstruirlo.
3. **Tipos:** `src/features/estudiantes/model/types.ts` describe el JSON del backend.
4. **Servicios:** `src/features/estudiantes/api/estudiantesApi.ts` separa listado y detalle de la presentación.
5. **Interfaz:** `EstudiantesPanel.tsx` maneja carga inicial, arreglo vacío, datos, error, reintento y actualización. `DashboardPage.tsx` compone la pantalla.
6. **Estado:** TanStack Query, ya incluido en la base, administra las consultas, cancelación con AbortSignal, caché y estados; useState conserva el ID seleccionado. Las solicitudes no se ejecutan directamente durante el render.
7. **Interacción adicional elegida:** opción A, consulta de detalle mediante GET por ID. No se inventaron filtros que el backend no admite.
8. **Autenticación:** se conservaron el formulario y las rutas de la base. El backend continúa siendo quien autoriza cada operación.

### Correcciones necesarias en el backend

En `src/main/java/com/uam/gestionacademica/infrastructure/security/SecurityConfig.java` se cambió:

```java
// Antes: establece un separador, no el nombre del claim.
authoritiesConverter.setAuthoritiesClaimDelimiter(ROLES_CLAIM);
// Después: lee el claim roles que realmente emite JwtTokenProvider.
authoritiesConverter.setAuthoritiesClaimName(ROLES_CLAIM);
```

Se conserva el prefijo `ROLE_` y las restricciones ADMIN/DOCENTE. Sin esta corrección, el JWT podía ser válido pero no producir los roles necesarios. No se cambió el repositorio remoto.

Además, el GET de `CarreraController` usaba `hasAnyRoles`, una expresión inválida. Se corrigió a `hasAnyRole` conservando los roles ADMIN, DOCENTE y ESTUDIANTE. Se añadió una prueba de seguridad para verificar el listado con los tres roles y el rechazo de un rol no autorizado.

Referencia oficial: https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/server/resource/authentication/JwtGrantedAuthoritiesConverter.html

## Preparar los datos antes de presentar

En la base que usarás para la presentación, ejecuta Login, 05 - Crear carrera y 06 - Crear estudiante con ADMIN; luego verifica 02 - Listar estudiantes y el detalle desde la web. Los datos de la prueba temporal no viajan dentro del ZIP. Si los registros ya existen, usa sus IDs: no repitas las altas con el mismo código de carrera o correo. Comprueba esto antes de la clase.

## Demostración con navegador y Postman

1. Importa `Sesion12.postman_collection.json` en Postman. Define `username` y `password` en las variables de la colección. `baseUrl` apunta directamente al backend.
2. Envía 01 - Login. Su script guarda el token localmente para las solicitudes siguientes. No compartas una exportación con el token o la contraseña rellenados.
3. Envía 02 - Listar estudiantes. Comprueba el arreglo y el estado 200; el script guarda un ID disponible para 03 - Detalle. Si el arreglo está vacío, crea primero los datos opcionales 05 y 06, o usa registros de tu proyecto.
4. En la web, abre DevTools > Network, selecciona Fetch/XHR y pulsa Actualizar lista. La URL del navegador es `http://localhost:5173/api/v1/estudiantes`; Vite la reenvía a `http://localhost:9090/api/v1/estudiantes`. Compara estado 200 y el mismo JSON con Postman.
5. Pulsa Ver detalle y verifica una nueva solicitud a `/api/v1/estudiantes/{id}`. Compara el objeto con 03 - Detalle.
6. **Carga:** aplica una limitación de red lenta en DevTools y recarga. Se muestra «Cargando estudiantes…»; durante login se muestra «Ingresando…».
7. **Vacío:** consulta una base de prueba sin estudiantes; la respuesta `[]` produce «No hay estudiantes registrados». No es necesario borrar registros de una base que uses para otro trabajo.
8. **Conexión:** detén el backend y pulsa Actualizar lista. Se muestra un error con Reintentar (un fallo del proxy puede llegar como 500). Reinicia la API y vuelve a intentarlo. La modalidad Offline de DevTools permite comprobar un fallo de red directo.
9. **401:** ejecuta 04 - Sin token en Postman. También puedes usar un token inválido o esperar la expiración de la sesión. En la web la sesión inválida vuelve al login.
10. **403:** inicia sesión con un usuario de rol ESTUDIANTE existente en tu base. No tiene acceso al listado; debe aparecer «Acceso denegado». Los roles ADMIN y DOCENTE sí pueden consultar.

No muestres Authorization ni el contenido del almacenamiento de sesión en capturas públicas.

## Respuestas para la explicación oral

**1. ¿Qué hacen VITE_API_BASE_URL y el proxy?** La variable define el prefijo que utiliza el cliente HTTP (`/api/v1`). El proxy recibe las solicitudes `/api` en Vite y las reenvía al puerto 9090. Así el navegador utiliza el mismo origen del frontend durante el desarrollo.

**2. ¿Por qué separar HTTP de React?** Evita repetir headers, tratamiento de errores y autenticación en cada pantalla. Los servicios expresan las operaciones del negocio y los componentes se concentran en mostrar información e interacciones. Esto facilita pruebas y cambios de endpoints.

**3. ¿Qué diferencia hay entre datos, carga y error?** Datos es la respuesta recibida; carga indica una consulta pendiente; error indica que falló. Una respuesta vacía es un éxito sin registros, no un error. Tener estados separados permite mostrar el mensaje adecuado y ofrecer reintentos.

**4. ¿Qué contrato hubo que comprobar?** Rutas, métodos, puerto, JSON de login, estructura del listado y detalle, nombres y tipos de campos, roles permitidos, Bearer y códigos 401/403/404. También la diferencia entre `carrera` de entrada y `carreraId` de salida.

**5. ¿Qué mejoraría el mantenimiento?** Generar y mantener OpenAPI para compartir el contrato, validar respuestas en tiempo de ejecución y automatizar pruebas de integración en CI. TanStack Query y la separación por módulos ya reducen duplicaciones en esta solución.

## Validación realizada

- Revisión posterior: `mvnw.cmd -Dtest=CarreraControllerSecurityTests test` pasó 4 pruebas de autorización del listado de carreras: ADMIN, DOCENTE y ESTUDIANTE permitidos; INVITADO rechazado.

- `pnpm build`: correcto, TypeScript y compilación Vite.
- `pnpm test`: 8 pruebas de componentes/cliente HTTP con respuestas controladas: carga/datos/detalle, vacío, red/reintento, 403, 401, login público rechazado, 500 y detalle inexistente.
- Backend compilado con Java 21 mediante `mvnw.cmd -DskipTests package`; esto verifica compilación y empaquetado, no ejecuta el test de contexto del repositorio.
- Integración real con Spring Boot y PostgreSQL 17 en una base temporal local: login 200, lista vacía 200, alta de carrera/estudiantes 201, listado y detalle 200 mediante el proxy Vite, inexistente 404, falta de token y token inválido 401, rol ESTUDIANTE 403.
- Navegador: login, estado vacío, actualización de lista y consulta de detalle con la API real comprobados.
- La colección de Postman fue preparada para la demostración; las peticiones equivalentes se ejecutaron por HTTP. No se ha afirmado haber ejecutado la interfaz de Postman.

La guía solicita una demostración funcional, no un informe de capturas. Este README sirve como ayuda para arrancar y explicar el proyecto.
