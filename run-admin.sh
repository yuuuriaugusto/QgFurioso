#!/bin/bash

# Definindo cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================${NC}"
echo -e "${GREEN}Iniciando Painel Administrativo do QG FURIOSO${NC}"
echo -e "${BLUE}====================================${NC}"

# Navegar para o diretório do Admin Panel
cd qg-furioso-admin

# Verificar se node_modules existe, caso contrário instalar as dependências
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Instalando dependências do Admin Panel...${NC}"
  npm install
  echo -e "${GREEN}Dependências instaladas com sucesso!${NC}"
fi

# Verificar se .env existe, se não, criar a partir do .env.example
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo -e "${YELLOW}Criando arquivo .env a partir de .env.example...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Arquivo .env criado com sucesso!${NC}"
fi

# Iniciar o servidor de desenvolvimento
echo -e "${BLUE}Iniciando o servidor do Painel Administrativo...${NC}"
echo -e "${BLUE}O Admin Panel estará disponível em: ${GREEN}http://localhost:5174${NC}"
echo -e "${BLUE}Pressione Ctrl+C para parar${NC}"
npm run dev