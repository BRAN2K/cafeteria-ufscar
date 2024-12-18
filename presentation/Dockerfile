# Etapa 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Copia apenas arquivos de dependência
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Builda o projeto para produção
RUN npm run build

# Etapa 2: Servir conteúdo estático
FROM node:18-alpine

WORKDIR /app

# Instala um servidor estático simples
RUN npm install -g serve

# Copia a pasta buildada
COPY --from=builder /app/dist ./dist

EXPOSE 5173

# Inicia o servidor estático
CMD ["serve", "-s", "dist", "-l", "5173"]
