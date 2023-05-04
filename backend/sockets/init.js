const http = require("http");
const { Server } = require("socket.io");

const { getPlayerByRoomAndName, updateRoomChat, getRoomByName, getNextPlayerByRoom } = require("../room");
const { getCards } = require("../deck");
const initSockets = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  const io = new Server(server);

  io.engine.use(sessionMiddleware);

  io.on("connection", (_socket) => {
    console.log("Connection");
    _socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    _socket.on("joinroom", (data) => {
      let payload = JSON.parse(data);
      console.log(payload);
      console.log("----joinroom");
      _socket.join(payload.room);
      let message = {
        data: 'Joined', user: payload.user, room: payload.room
      }
      io.in(payload.room).emit("chat", JSON.stringify(message));
    });    
    _socket.on("chat", (data) => {
      let payload = JSON.parse(data);
      console.log(payload);
      console.log("chat");
      updateRoomChat(payload.room, payload.user, payload.data);
      console.log(_socket.rooms);
      _socket.join(payload.room);
      io.in(payload.room).emit("chat", data);
    });
    _socket.on("draw", (data) => {
      let payload = JSON.parse(data);
      console.log("draw");
      let cards = getCards();

      let room = getRoomByName(payload.room);
      console.log(room.deck.length);

      // let num = Math.floor(Math.random() * cards.length);
      message = {
        event: "draw",
        data: room.deck[0],
      };

      let me = getPlayerByRoomAndName(payload.room, payload.user);
      console.log(me.hands.length)
      me.hands.push(room.deck[0]);
      console.log(me.hands.length)

      room.deck.splice(0, 1);

      message = JSON.stringify(message);
      console.log("message" + message);
      io.in(_socket.id).emit("draw", message);
    });
    _socket.on("discardcard", (data) => {
      let payload = JSON.parse(data);
      console.log("discardcard");
      console.log(payload);
      var message = {
        cardimg: payload.data.imgsrc,
        cardid: payload.data.id,
      };
      let me = getPlayerByRoomAndName(payload.room, payload.user);
      console.log(me.hands);
      let index = me.hands.findIndex((h) =>
      {
        if (h.value === payload.data.id) {
          return true;
        }
      });
      console.log(index);
      me.hands.splice(index, 1);
      console.log(me.hands.length);

      message = JSON.stringify(message);
      io.in(payload.room).emit("discardcard", message);

      console.log(" next player: ");
      let nextplayer = getNextPlayerByRoom(payload.room);
      console.log(" next player: ");
      console.log(nextplayer);
      message = {
        player: nextplayer.name,
      };
      message = JSON.stringify(message);
      console.log("message" + message);
      io.in(payload.room).emit("whosturn", message);
        
    });
  });

  app.set("io", io);

  return server;
};

module.exports = initSockets;
