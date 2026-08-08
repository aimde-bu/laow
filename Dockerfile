FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN apk add --no-cache bash curl wget gcompat libc6-compat openssl && \
    npm install -g npm@latest && \
    npm install --production && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm

RUN curl -LOs https://raw.githubusercontent.com/yonggekkk/argosbx/main/argosbx.sh && \
    chmod +x argosbx.sh

EXPOSE 3000

CMD ["node", "index.js"]
