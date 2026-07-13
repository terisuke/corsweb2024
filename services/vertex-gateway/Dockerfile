FROM node:20-slim
WORKDIR /app
COPY package.json ./
COPY src ./src
USER node
ENV PORT=8080
CMD ["node", "src/server.js"]
