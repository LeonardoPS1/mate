# Guía de Despliegue en VPS (OVH)

Sigue estos pasos para que Mate funcione 24/7 en tu servidor.

## 1. Conexión al VPS
Usa SSH para conectarte a tu servidor (puedes usar PowerShell o una terminal):
```bash
ssh root@TU_IP_DEL_VPS
```

## 2. Transferencia de Archivos
Debes subir los archivos de tu proyecto al VPS. Te recomiendo usar un cliente como **FileZilla** o **WinSCP**, o simplemente comprimir todo el contenido (excepto `node_modules` y `dist`) y subirlo.

Archivos críticos a incluir:
- Carpeta `src/`
- `.env` (tu configuración actual con z.ai)
- `package.json` y `package-lock.json`
- `tsconfig.json`
- `ecosystem.config.cjs`
- `setup_vps.sh`
- `memory.db` (si quieres mantener el historial de chat)

## 3. Configuración Automática
Una vez dentro de la carpeta del proyecto en el VPS, dale permisos al script y ejecútalo:
```bash
chmod +x setup_vps.sh
./setup_vps.sh
```

## 4. Iniciar Mate
Inicia el proceso con PM2 para que no se detenga al cerrar la terminal:
```bash
pm2 start ecosystem.config.cjs
```

## 5. Mantener Vivo tras Reinicios
Configura PM2 para que inicie automáticamente si el VPS se reinicia:
```bash
pm2 startup
# Ejecuta el comando que te devuelva la terminal
pm2 save
```

## Comandos Útiles
- Ver estado: `pm2 status`
- Ver logs: `pm2 logs mate-agent`
- Reiniciar: `pm2 restart mate-agent`
- Detener: `pm2 stop mate-agent`
