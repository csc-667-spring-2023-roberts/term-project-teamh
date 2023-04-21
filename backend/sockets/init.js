const http = require("http");
const { Server } = require("socket.io");

const { updateRoomChat } = require("../room");
const {getCards} = require('../deck');
const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (_socket) => {
    console.log("Connection");
    _socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    _socket.on("chat", (data) => {
      let payload = JSON.parse(data);
      console.log(payload);
      console.log("chat");
      updateRoomChat(payload.room, payload.user, payload.data);
      io.emit('chat', data);
    });
    _socket.on("draw", (data) => {
      console.log("draw");
      let cards = getCards();

      let num = Math.floor(Math.random() * cards.length);
      message = {
        event: 'draw',
        data: cards[num]
      };
      message = JSON.stringify(message);
      console.log('message' + message);
      io.emit('draw', message);
    });
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;