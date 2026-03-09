#!/bin/bash

# Setup colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Actualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}>>> Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo -e "${GREEN}>>> Instalando PM2...${NC}"
sudo npm install -g pm2

echo -e "${GREEN}>>> Instalando dependencias del proyecto...${NC}"
npm install

echo -e "${GREEN}>>> Creando carpeta de logs...${NC}"
mkdir -p logs

echo -e "${GREEN}>>> Instalación completada.${NC}"
echo -e "Para iniciar el bot, usa: ${GREEN}pm2 start ecosystem.config.cjs${NC}"
echo -e "Para ver logs en tiempo real: ${GREEN}pm2 logs mate-agent${NC}"
