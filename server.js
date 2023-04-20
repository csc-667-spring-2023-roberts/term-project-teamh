const path = require("path");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const express = require("express");
var session = require('express-session');
require("dotenv").config();

const {getCards} = require('./backend/deck.js');
const app = express();
const testRoutes = require("./backend/routes/test/index.js");

app.use("/test", testRoutes);

const WebSocket = require('ws');

const oneDay = 1000 * 60 * 60 * 24;
app.use(session(
  {
    secret: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: oneDay },
  }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("views", path.join(__dirname, "backend", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "backend", "static")));

const rootRoutes = require("./backend/routes/root");
app.use("/", rootRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((request, response, next) => {
  next(createError(404));
});

rooms = [
  { name: 'room1', host: 'abc', players: [{ name: 'player1' }] },
  { name: 'room2', host: 'xyz', players: [] },
]
roomchats = [
  { 
    name: 'room1', chats: [
    { 
      player: 'player1',
      message: 'hello'
    }] 
  },
]

let cards = getCards()

console.log(cards)

const wss = new WebSocket.Server({ port: 3001 });
wss.on('connection', ws => {
  message = {
    event: "socket",
    data: "connection established"
  }
  console.log('New client connected!')
  message = JSON.stringify(message)
  ws.send(message)
  ws.on('open', () => console.log('Connection Open'))
  ws.on('close', () => console.log('Client has disconnected!'))
  ws.on('message', data => {
    wss.clients.forEach(client => {
      console.log(`message to all client: ${data}`)
      if (client.readyState === WebSocket.OPEN) {

        let payload = JSON.parse(data)
        console.log(payload)

        message = {
          event: "chat",
          data: payload.data,
          user: payload.user
        }
        message = JSON.stringify(message)
        client.send(message)

        console.log ('card length: ')
        console.log(cards.length)
        num = Math.floor(Math.random() * cards.length)
        console.log(num)
        message = {
          event: 'draw',
          data: cards[num]
        }
        message = JSON.stringify(message)
        console.log('message' + message);
        client.send(message)
			}
    })
  })
  ws.onerror = function () {
    console.log('websocket error')
  }
})

if (process.env.NODE_ENV === "development") {
  const livereload = require("livereload");
  const connectLiveReload = require("connect-livereload");

  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, "backend", "static"));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLiveReload());
}
