FROM tfrkd/puppeteer:0.10.1

RUN npm install @slack/client

WORKDIR /app
COPY app /app

CMD ["node", "app.js"]
