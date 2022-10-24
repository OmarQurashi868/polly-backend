FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL=mongodb+srv://polly-backend:ccEn5Eg4gncA5lNX@cluster0.8p8oe.mongodb.net/polls?retryWrites=true&w=majority

ENV PORT=8080

EXPOSE 8080

CMD [ "npm", "start" ]