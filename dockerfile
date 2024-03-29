FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN tsc

CMD ["node", "index.js"]