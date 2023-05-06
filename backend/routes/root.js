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
  console.log(rooms);
  response.render("home", {
    title: "Welcome to Uno!",
    user: request.session.user,
    openrooms: rooms,
    login: true
  });
});
router.get("/login", (_request, response) => {
  response.render("login", { title: "Uno Game (Login)" });
});

router.get("/signUp", (_request, response) => {
  response.render("signUp", { title: "Uno Game (signUp)" });
});

router.get("/createGame", (_request, response) => {
  response.render("createGame", { title: "Create Game" });
});

router.get("/joingame", (request, response) => {
  console.log("----joingame----");

  let result = getRoomByName(request.query.room);

  const query = querystring.stringify(request.query);

  response.render("joinGame", { title: "Join Game", room: request.query.room });
});

router.post("/joingame", (request, response) => {
  console.log("----POST joingame----");
  console.log(request.body);
  let room = getRoomByName(request.body.room);
  console.log(room);
  room.players.push({
    name: request.session.user,
    hands: [],
  });
  const query = querystring.stringify({ room: request.body.room });
  console.log(query);
  response.redirect("/waitingroom?" + query);
});

router.get("/", function (_request, response) {
  console.log(rooms);
  response.render("loggedOutHome", {
    openrooms: rooms,
  });
});

router.post(
  "/login",
  express.urlencoded({ extended: false }),
  function (request, response, next) {
    request.session.regenerate(function (err) {
      if (err) next(err);

      // store user information in session, typically a user id
      request.session.user = request.body.user;

      // save the session before redirection to ensure page
      // load does not happen before session is saved
      request.session.save(function (err) {
        if (err) return next(err);
        response.redirect("/");
      });
    });
  }
);

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
    host: request.session.user,
    players: [{ name: request.session.user, hands: [] }],
    currentplayer: 0,
    discardcard: {},
    status: 'Waiting'
  });
  roomchats.push({
    name: request.body.roomname,
    chats: [],
  });
  console.log(rooms);

  const query = querystring.stringify({ room: request.body.roomname });

  response.redirect("/waitingroom?" + query);
});
router.post("/newgame", (request, response) => {
  response.redirect("/");
});

router.get("/waitingroom", isAuthenticated, (request, response) => {
  console.log("----waitingroom----");
  let result = getRoomByName(request.query.room);
  //console.log(result)
  let roomchat = getRoomChatByName(request.query.room);
  //console.log(roomchat)

  let me = getPlayerByRoomAndName(request.query.room, request.session.user);
  if (me === undefined) {
    response.redirect("/");
  } else {
    let chats = [];

    if (roomchat !== undefined) {
      chats = roomchat.chats;
    }
    response.render("waitingroom", {
      roomname: result.name,
      host: result.host,
      players: result.players,
      chats: chats,
    });
  }
});
router.get("/waitingroom", (request, response) => {
  response.redirect("/");
});

router.get("/startgame", isAuthenticated, (request, response) => {
  console.log("----startgame----");

  let result = getRoomByName(request.query.room);
  result.status = 'In Progress'
  let c = getCards().map((x) => x);
  c = shuffle(c);
  result.deck = c;

  let x = result.players.length * 7;
  for (let i = 0; i < result.players.length; i++) {
    const hands = c.slice(0, 7);
    result.players[i].hands = hands;
    result.deck.splice(0, 7);
  }

  let firstdiscard = result.deck[0];
  result.deck.splice(0, 1);
  result.discardcard = firstdiscard;

  const io = request.app.get("io");
  let message = JSON.stringify({room: request.query.room});
  io.in(request.query.room).emit("startgame", message);

  const query = querystring.stringify(request.query);
  console.log(query);
  response.redirect("/game?" + query);
});

router.get("/game", isAuthenticated, (request, response) => {
  console.log("----game----");

  let result = getRoomByName(request.query.room);

  player = getPlayerByRoomAndName(request.query.room, request.session.user);

  let roomchat = getRoomChatByName(request.query.room);

  let chats = [];

  let curplayer = getCurrentPlayerByRoom(request.query.room);
  
  if (roomchat !== undefined) {
    chats = roomchat.chats;
  }
  console.log((curplayer.name))
  console.log((player.name))
  console.log((curplayer.name === player.name))
  response.render("game", {
    roomname: result.name,
    host: result.host,
    players: result.players,
    me: player,
    chats: chats,
    firstdiscard: result.discardcard,
    cardsleft: result.deck.length,
    myturn: (curplayer.name === player.name)
  });
});
router.get("/game", (request, response) => {
  response.redirect("/");
});

router.post("/:id", (request, response) => {
  const io = request.app.get("io");

  const { message } = request.body;
  const sender = request.session.user.username;

  io.emit("chat-message", { message, sender });
});

module.exports = router;
