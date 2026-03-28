FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Τρέχουμε το vite με --host για να είναι προσβάσιμο έξω από το container
CMD ["npm", "run", "dev", "--", "--host"]