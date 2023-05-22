const express = require("express");
const querystring = require("querystring");

const {
  getRoomByName,
  getRoomChatByName,
  getPlayerByRoomAndName,
  getCurrentPlayerByRoom,
} = require("../room");
const { getCards, shuffle } = require("../deck");

const router = express.Router();

// middleware to test if authenticated
function isAuthenticated(req, res, next) {
  console.log("---isAuthenticated---");
  if (req.session.user) {
    console.log("Session is valid");
    next();
  } else next("route");
}

// a middleware function with no mount path. This code is executed for every request to the router
router.use((request, response, next) => {
  console.log("Time:", Date.now());
  response.header(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate"
  );
  response.header("Expires", "-1");
  response.header("Pragma", "no-cache");
  if (!request.session.user) {
    console.log("session timeout");
  }
  next();
});

router.get("/", isAuthenticated, (request, response) => {
  response.render("home", {
    title: "Welcome to Uno!",
    user: request.session.user.username,
    openrooms: rooms,
    login: true,
  });
});
router.get("/login", (_request, response) => {
  response.render("login", { title: "Uno Game (Login)" , "error": ""});
});

router.get("/signUp", (_request, response) => {
  response.render("signUp", { title: "Uno Game (signUp)", "error": ""});
});

router.get("/createGame", (_request, response) => {
  response.render("createGame", { title: "Create Game" });
});

router.get("/joingame", (request, response) => {
  console.log("----joingame----");
  let error = request.query.error;
  if (error === undefined) {
    error = "";
  }
  response.render("joinGame", {
    title: "Join Game",
    room: request.query.room,
    error: error,
  });
});

router.post("/joingame", (request, response) => {
  console.log("----POST joingame----");
  let room = getRoomByName(request.body.room);
  if (room != null) {
    if (room.password !== request.body.password) {
      response.redirect(
        "/joingame?room=" + request.body.room + "&error=password"
      );
    } else {
      room.players.push({
        name: request.session.user.username,
        hands: [],
      });
      const query = querystring.stringify({ room: request.body.room });
      console.log(query);
      response.redirect("/waitingroom?" + query);
    }
  } else {
    response.redirect("/joingame?room=" + request.body.room + "&error=room");
  }
});

router.get("/", function (_request, response) {
  response.render("loggedOutHome", {
    openrooms: rooms,
  });
});

// Root route for rules page
router.get("/rules", (request, response) => {
  response.render("rules", {
    title: "UNO Rules",
    message: "These are the rules for uno",
  });
});

// Logout page
router.get("/logout", (request, response) => {
  response.header(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate"
  );
  response.header("Expires", "-1");
  response.header("Pragma", "no-cache");
  request.session.destroy();
  response.render("logout", {
    title: "Logout",
    message: "Your are logged out",
  });
});

// new game
router.post("/newgame", isAuthenticated, (request, response) => {
  console.log("--- newgame ----");
  rooms.push({
    name: request.body.roomname,
    password: request.body.password,
    numberOfPlayers: request.body.numberPlayer,
    host: request.session.user.username,
    players: [{ name: request.session.user.username, hands: [] }],
    currentplayer: 0,
    discardcard: {},
    reverse: false,
    status: "Waiting",
    discardPile: [],
  });
  roomchats.push({
    name: request.body.roomname,
    chats: [],
  });

  const query = querystring.stringify({ room: request.body.roomname });

  response.redirect("/waitingroom?" + query);
});
router.post("/newgame", (request, response) => {
  response.redirect("/");
});

router.get("/waitingroom", isAuthenticated, (request, response) => {
  console.log("----waitingroom----");
  let room = getRoomByName(request.query.room);
  let roomchat = getRoomChatByName(request.query.room);

  let me = getPlayerByRoomAndName(request.query.room, request.session.user.username);
  if (me === undefined) {
    response.redirect("/");
  } else {
    let chats = [];

    if (roomchat !== undefined) {
      chats = roomchat.chats;
    }
    response.render("waitingroom", {
      roomname: room.name,
      host: room.host,
      players: room.players,
      chats: chats,
      ishost: room.host === me.name,
    });
  }
});
router.get("/waitingroom", (request, response) => {
  response.redirect("/");
});

router.get("/startgame", isAuthenticated, (request, response) => {
  console.log("----startgame----");

  let room = getRoomByName(request.query.room);
  room.status = "In Progress";
  let c = getCards().map((x) => x);
  c = shuffle(c);
  room.deck = c;

  let x = room.players.length * 7;
  for (let i = 0; i < room.players.length; i++) {
    const hands = c.slice(0, 7);
    room.players[i].hands = hands;
    room.deck.splice(0, 7);
  }

  while (true) {
    console.log("--- re-shuffle");
    c = shuffle(room.deck);
    room.deck = c;
    console.log(room.deck[0].type);
    if (room.deck[0].type !== "wild" && room.deck[0].type !== "wild4") break;
  }
  let firstdiscard = room.deck[0];
  room.deck.splice(0, 1);
  room.discardcard = firstdiscard;
  room.discardPile.push(firstdiscard);

  const io = request.app.get("io");
  let message = JSON.stringify({ room: request.query.room });
  io.in(request.query.room).emit("startgame", message);

  const query = querystring.stringify(request.query);
  response.redirect("/game?" + query);
});

router.get("/game", isAuthenticated, (request, response) => {
  console.log("----game----");

  let result = getRoomByName(request.query.room);

  player = getPlayerByRoomAndName(request.query.room, request.session.user.username);

  let roomchat = getRoomChatByName(request.query.room);

  let chats = [];

  let curplayer = getCurrentPlayerByRoom(request.query.room);

  if (roomchat !== undefined) {
    chats = roomchat.chats;
  }
  response.render("game", {
    roomname: result.name,
    host: result.host,
    players: result.players,
    me: player,
    chats: chats,
    firstdiscard: result.discardcard,
    cardsleft: result.deck.length,
    myturn: curplayer.name === player.name,
  });
});
router.get("/game", (request, response) => {
  response.redirect("/");
});

router.get("/looseScreen", (_request, response) => {
  response.render("looseScreen", { title: "Uno Game (Loosing Screen)" });
});
router.get("/winScreen", (_request, response) => {
  response.render("winScreen", { title: "Uno Game (Winning Screen)" });
});

router.post("/:id", (request, response) => {
  const io = request.app.get("io");

  const { message } = request.body;
  const sender = request.session.user.username;

  io.emit("chat-message", { message, sender });
});

module.exports = router;
