$ErrorActionPreference = 'Stop'
$raiz = $PSScriptRoot
$local = Join-Path $raiz '.practica-local'
$config = Get-Content (Join-Path $local 'config.json') | ConvertFrom-Json
$pg = 'C:\Program Files\PostgreSQL\17\bin'
& "$pg\pg_ctl.exe" status -D "$local\postgres" *> $null
if ($LASTEXITCODE -ne 0) {
    & "$pg\pg_ctl.exe" start -D "$local\postgres" -l "$local\postgres.log" -o '-p 55432 -h 127.0.0.1' -w
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar PostgreSQL de practica.' }
}
$env:PGPASSWORD = $config.DbPassword
$existe = & "$pg\psql.exe" -h 127.0.0.1 -p 55432 -U practica -d postgres -Atc "SELECT 1 FROM pg_database WHERE datname='universidad'"
if ($existe -ne '1') { & "$pg\createdb.exe" -h 127.0.0.1 -p 55432 -U practica universidad }
Remove-Item Env:PGPASSWORD
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://127.0.0.1:55432/universidad'
$env:DB_USERNAME = 'practica'
$env:DB_PASSWORD = $config.DbPassword
$env:ADMIN_USERNAME = 'admin'
$env:ADMIN_PASSWORD = $config.AdminPassword
$env:JWT_SECRET = $config.JwtSecret
$nodeDir = 'C:\Users\stacy\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$env:PATH = "$nodeDir;$env:JAVA_HOME\bin;$env:PATH"
if (-not (Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue)) {
    $maven = 'C:\Users\stacy\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd'
    Start-Process -FilePath $maven -ArgumentList '-B','-ntp','spring-boot:run' -WorkingDirectory "$raiz\gestion-academica-backend" -WindowStyle Hidden -RedirectStandardOutput "$local\backend.log" -RedirectStandardError "$local\backend-error.log"
}
if (-not (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath "$nodeDir\node.exe" -ArgumentList 'node_modules/vite/bin/vite.js','--host','127.0.0.1','--strictPort' -WorkingDirectory "$raiz\gestion-academica-web" -WindowStyle Hidden -RedirectStandardOutput "$local\frontend.log" -RedirectStandardError "$local\frontend-error.log"
}
Write-Host 'Iniciando. Frontend: http://localhost:5173 | Backend: http://localhost:9090'
Write-Host 'Usuario: admin | Clave de practica: Practica12!2026'
Write-Host 'Los registros de inicio se encuentran en .practica-local.'
