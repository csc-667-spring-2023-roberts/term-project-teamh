const http = require("http");
const { Server } = require("socket.io");

const { getPlayerByRoomAndName, updateRoomChat, getRoomByName, getNextPlayerByRoom } = require("../room");
const { getCards, getCardsById, shuffle } = require("../deck");
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
      handleJoinRoom(io, _socket, data, false);
    });
    _socket.on("joingameroom", (data) => {
      handleJoinRoom(io, _socket, data, true);
    });  
    _socket.on("chat", (data) => {
      handleChat(io, _socket, data);
    });
    _socket.on("draw", (data) => {
      handleDrawCard(io, _socket, data);
    });
    _socket.on("candiscardcard", (data, callback) => {
      handleCanDiscardCard(_socket, data, callback)
    });
    _socket.on("discardcard", (data) => {
      handleDiscardCard(io, _socket, data);        
    });
    _socket.on("shouldEndTurn", (data, callback) => {
      handleShouldEndTurn(io, _socket, data, callback);        
    });
    _socket.on("endTurn", (data) => {
      handleEndTurn(io, _socket, data);        
    });
  });

  app.set("io", io);

  return server;
};

const handleChat = (io, socket, data) => {
  let payload = JSON.parse(data);
  console.log(payload);
  console.log("chat");
  updateRoomChat(payload.room, payload.user, payload.data);
  console.log(socket.rooms);
  socket.join(payload.room);
  io.in(payload.room).emit("chat", data);
}

const handleJoinRoom = (io, socket, data, gameroom) => {
  let payload = JSON.parse(data);
  console.log(payload);
  console.log(gameroom);
  console.log("----joinroom");
  socket.join(payload.room);
  let message = {
    data: 'Joined', user: payload.user, room: payload.room
  }
  io.in(payload.room).emit("chat", JSON.stringify(message));
  
  let room = getRoomByName(payload.room);
  if (gameroom === false) {
    io.in(payload.room).emit("waitroom-update", JSON.stringify(room));
  } else {
    io.in(payload.room).emit("gameroom-player-update", JSON.stringify(room));
  }
}

const handleDrawCard = (io, socket, data) => {
  let payload = JSON.parse(data);
  console.log("draw");

  let room = getRoomByName(payload.room);
  let me = getPlayerByRoomAndName(payload.room, payload.user);
  
  // can I draw
  let index = me.hands.findIndex((c) =>
  {
    if (c.color === room.discardcard.color || 
      (c.type === 'number' && c.value === room.discardcard.value)) {
      return true;
    }
  });
  
  console.log('---- index' + index);
  // if index >= 0, it means there is a valid card to discard
  // don't draw card
  if (index >= 0) {
    return;
  }
  console.log(room.deck.length);

  // no more cards, re-fill from discard pile
  if (room.deck.length == 0) {
    let curDisCard = room.discardPile[room.discardPile.length-1];
    console.log('curDiscard' + curDisCard);
    room.discardPile.splice(room.discardPile.length-1, 1);
    let c = room.discardPile.map((x) => x);
    c = shuffle(c);
    room.deck = c;
    room.discardPile = [];
    room.discardPile.push(curDisCard);  
  }
  for (i = 0; i < room.deck.length; i++) {
    if (room.deck[i].type === 'wild4') {
      room.deck[i].color = 'wild4';
      room.deck[i].value = -1;
    }
    if (room.deck[i].type === 'wild') {
      room.deck[i].color = 'wild';
    }
  }

  message = {
    data: room.deck[0],
  };

  // tell client that a card is drawed
  me.hands.push(room.deck[0]);
  room.deck.splice(0, 1);
  message = JSON.stringify(message);
  console.log("message" + message);
  io.in(socket.id).emit("draw", message);

  // tell all clients to update remaining card count
  message = {
    cardsleft: room.deck.length,
  };
  message = JSON.stringify(message);
  io.in(payload.room).emit("update-cards-left", message);

  // after a card is drawn, can I discard this card?
  index = me.hands.findIndex((c) =>
  {
    if (c.color === room.discardcard.color 
      || (c.type === 'number' && c.value === room.discardcard.value)
      || c.type === 'reverse' && room.discardcard.type == 'reverse' ) {
      return true;
    }
  });
  
  // there is no card to discard, tell everyone there is a next turn
  console.log('---- index' + index);
  if (index == -1) {
    // console.log(" next player: ");
    let nextplayer = getNextPlayerByRoom(payload.room);
    // console.log(" next player: ");
    // console.log(nextplayer);
    message = {
      player: nextplayer.name,
    };
    message = JSON.stringify(message);
    // console.log("message" + message);
    io.in(payload.room).emit("whosturn", message);
    io.in(payload.room).emit("gameroom-player-update", JSON.stringify(room));
  }
}

const handleDiscardCard = (io, socket, data) => {
  let payload = JSON.parse(data);
  console.log("discardcard");
  console.log(payload);
  let room = getRoomByName(payload.room);
  let me = getPlayerByRoomAndName(payload.room, payload.user);
  console.log(me.hands);
  // find the card the user is discarding in their hand
  let index = me.hands.findIndex((h) =>
  {
    if (h.cardId === payload.data.id) {
      return true;
    }
  });
  let dis = me.hands.splice(index, 1);  // remove it from the hand
  room.discardcard = dis[0];
  console.log(room.discardPile);
  let cur = room.discardPile[room.discardPile.length - 1];
  if (dis[0].type === 'wild'){
    dis[0].color = cur.color;
  }
  room.discardPile.push(dis[0]);

  // tell all clients a card is discarded
  var message = {
    cardimg: payload.data.imgsrc,
    cardid: payload.data.id,
  };
  message = JSON.stringify(message);
  io.in(payload.room).emit("discardcard", message);

  if (room.discardcard.type === 'reverse') {
    room.reverse = true;
  }
  
  // if this player still has cards, continue
  if (me.hands.length != 0) {
    // tell all clients who the next player is
    console.log(" next player: ");
    let nextplayer = getNextPlayerByRoom(payload.room);
    // console.log(" next player: ");
    // console.log(nextplayer);
    message = {
      player: nextplayer.name,
    };
    message = JSON.stringify(message);
    console.log("message" + message);
    io.in(payload.room).emit("whosturn", message);
    io.in(payload.room).emit("gameroom-player-update", JSON.stringify(room));
  } else {
    console.log(" gameend: ");
    message = {
      room: room.name,
      winner: me.name,
    };
    console.log(message);
    io.in(payload.room).emit("gameend", JSON.stringify(message));
  }
}

const handleCanDiscardCard = (socket, data, callback) => {
  console.log("---handleCanDiscardCard---")
  let payload = JSON.parse(data);
  console.log(payload);
  let room = getRoomByName(payload.room);
  console.log(room.discardcard);
  let card = getCardsById(payload.cardid);
  let me = getPlayerByRoomAndName(payload.room, payload.user);

  if (card.color === room.discardcard.color 
    || (card.value === room.discardcard.value && card.type === 'number')
    || card.type === 'wild'
    || (card.type == 'reverse' && room.discardcard.type == 'reverse')) {
    callback({
      status: "yes"
    });
  } else {
    if (card.type === 'wild4') {
      // do i still have any cards i can discard
      let index = me.hands.findIndex((c) =>
      {
        if (c.color === room.discardcard.color || 
          (c.type === 'number' && c.value === room.discardcard.value)) {
          return true;
        }
      });
      console.log(index);
      if (index >= 0) {
        callback({
          status: "no"
        });   
      } else {
        callback({
          status: "yes"
        }); 
      }
    } else {
      callback({
        status: "no"
      }); 
    } 
  }
}

const handleShouldEndTurn = (io, socket, data, callback) => {
  console.log("---handleShouldEndTurn---")
  let payload = JSON.parse(data);
  console.log(payload);
  let room = getRoomByName(payload.room);
  let me = getPlayerByRoomAndName(payload.room, payload.user);

  if (room.discardcard.value == -1 && 
    (room.discardcard.type === 'pick2' || room.discardcard.type === 'skip' || room.discardcard.type === 'wild4') ) {
    if (room.discardcard.type === 'wild4') {
      console.log(room.discardcard.color);
      room.discardcard.color = room.discardPile[room.discardPile.length-2].color;
      console.log(room.discardcard.color);

      // draw first card 
      pick1Card(io, socket, room, me);

      // draw 2nd card
      pick1Card(io, socket, room, me);

      // draw 3rd card
      pick1Card(io, socket, room, me);
      
      // draw 4th card
      pick1Card(io, socket, room, me);

      let message = {
        cardsleft: room.deck.length,
      };
      message = JSON.stringify(message);
      io.in(payload.room).emit("update-cards-left", message);

    }      
    if (room.discardcard.type === 'pick2') {
      // draw first card if no more cards, re-fill from discard pile
      pick1Card(io, socket, room, me);

      // draw 2nd card, if no more cards, re-fill from discard pile
      pick1Card(io, socket, room, me);

      let message = {
        cardsleft: room.deck.length,
      };
      message = JSON.stringify(message);
      io.in(payload.room).emit("update-cards-left", message);
    }
    room.discardcard.value = -2;
    callback({
      status: "yes"
    });
  } else {
    callback({
      status: "no"
    });         
  }  
}
const handleEndTurn = (io, socket, data) => {
  console.log("---handleEndTurn---")
  let payload = JSON.parse(data);
  // console.log(payload);
  let nextplayer = getNextPlayerByRoom(payload.room);
  // console.log(" next player: ");
  // console.log(nextplayer);
  message = {
    player: nextplayer.name,
  };
  message = JSON.stringify(message);
  // console.log("message" + message);
  io.in(payload.room).emit("whosturn", message);
  let room = getRoomByName(payload.room);
  io.in(payload.room).emit("gameroom-player-update", JSON.stringify(room));
}

const pick1Card = (io, socket, room, me) => {
  // draw card and if there are no more cards, re-fill from discard pile
  if (room.deck.length == 0) {
    let curDisCard = room.discardPile[room.discardPile.length-1];
    console.log('curDiscard' + curDisCard);
    room.discardPile.splice(room.discardPile.length-1, 1);
    let c = room.discardPile.map((x) => x);
    c = shuffle(c);
    room.deck = c;
    room.discardPile = [];
    room.discardPile.push(curDisCard);
  }
  for (i = 0; i < room.deck.length; i++) {
    if (room.deck[i].type === 'wild4') {
      room.deck[i].color = 'wild4';
      room.deck[i].value = -1;
    }
    if (room.deck[i].type === 'wild') {
      room.deck[i].color = 'wild';
    }
  }
  let message = {
    data: room.deck[0],
  };

  me.hands.push(room.deck[0]);   
  room.deck.splice(0, 1);

  message = JSON.stringify(message);
  console.log("message" + message);
  io.in(socket.id).emit("draw", message);
}
module.exports = initSockets;
