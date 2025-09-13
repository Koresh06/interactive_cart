# FROM node:20-alpine

# WORKDIR /app
# COPY . /app/

# RUN npm install
# RUN npm run build
# RUN npm install -g serve

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g typescript
RUN npm run build
RUN npm install -g serve
