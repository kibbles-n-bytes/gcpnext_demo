FROM node:boron

WORKDIR /app
COPY package.json app.js /app/
RUN npm install

ENV PORT 8080
EXPOSE $PORT
ENTRYPOINT ["node", "app.js"]
