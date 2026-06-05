FROM node:18

WORKDIR /app/client

COPY package*.json ./

RUN npm install
#скопировать все файлы, кроме заигнорированных, например нод модули
COPY . .

##открывание порта
#EXPOSE 3000
#
#CMD ["node", "run start"]
