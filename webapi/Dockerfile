# Etapa 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Copia apenas os arquivos de dependências para aproveitar cache
COPY package*.json tsconfig.json ./
RUN npm install

# Copia o restante do código
COPY src ./src
RUN npm run build

# Etapa 2: Runtime
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copia o código compilado da etapa de build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# O backend acessa as variáveis de ambiente via process.env
CMD ["node", "dist/index.js"]
