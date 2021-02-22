# Install the base requirements for the app.
# This stage is to support development.
FROM node:14
# AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "void-firstrun.js"]
