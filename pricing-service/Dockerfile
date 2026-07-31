FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY server.js .

EXPOSE 4002

CMD ["npm", "start"]
