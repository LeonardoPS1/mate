#!/bin/bash

# Mate AI Agent - VPS Update Script
# Usage: ./update.sh

echo ">>> Bajando últimos cambios desde GitHub..."
git pull origin main

echo ">>> Instalando nuevas dependencias..."
npm install

echo ">>> Compilando proyecto..."
npm run build

echo ">>> Reiniciando el bot con PM2..."
pm2 restart mate-agent

echo ">>> ¡Mate actualizado y funcionando!"
pm2 status mate-agent
