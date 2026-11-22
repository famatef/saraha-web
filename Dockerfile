FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm --prefix frontend ci

COPY . .
RUN npm --prefix frontend run build

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY config/config.service.js ./config/config.service.js
COPY frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["npm", "start"]
