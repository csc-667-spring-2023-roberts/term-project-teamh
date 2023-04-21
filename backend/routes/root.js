const express = require("express");
const querystring = require('querystring');  

const { getRoomByName, getRoomChatByName } = require("../room");

const router = express.Router();

// middleware to test if authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else next("route")
}

// a middleware function with no mount path. This code is executed for every request to the router
router.use((request, response, next) => {
  console.log("Time:", Date.now())
  response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  response.header('Expires', '-1')
  response.header('Pragma', 'no-cache')
if (!request.session.user) {
    console.log('session timeout')
  }
  next()
})

router.get("/", isAuthenticated, (request, response) => {
  console.log(rooms)
  response.render("home", {
    title: "Welcome to Uno!",
    user: request.session.user,
    openrooms: rooms,
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
  console.log('----joingame----')

  let result = getRoomByName(request.query.room)

  //result.players.push({name:request.session.user})

  const query = querystring.stringify(request.query)

  response.render("joinGame", { title: "Join Game", room: request.query.room});
});

router.post("/joingame", (request, response) => {
  console.log('----POST joingame----')
  console.log(request.body)
  let result = getRoomByName(request.body.room)
  console.log(result)

  const query = querystring.stringify({room: request.body.room})
  console.log(query)
  response.redirect('/waitingroom?' + query)
});

router.get("/", function (_request, response) {
  response.render("loggedOutHome", {});
});





router.post(
  "/login",
  express.urlencoded({ extended: false }),
  function (request, response) {
  request.session.regenerate(function (err) {
    if (err) next(err)

    // store user information in session, typically a user id
    request.session.user = request.body.user

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    request.session.save(function (err) {
      if (err) return next(err)
      response.redirect("/")
    })
  })
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
  })
})


// new game
router.post("/newgame", isAuthenticated, (request, response) => {
  rooms.push({
    name: request.body.roomname,
    host: request.session.user,
    players: []
  })
  console.log('--- newgame ----')
  console.log(rooms)

  const query = querystring.stringify({room: request.body.roomname})

  response.redirect('/waitingroom?' + query)
})
router.post("/newgame", (request, response) => {
  response.redirect('/')
})

// router.get("/joingame", (request, response) => {

//   console.log('----joingame----')

//   let result = getRoomByName(request.query.room)

//   result.players.push({name:request.session.user})

//   const query = querystring.stringify(request.query)
//   console.log(query)
//   response.redirect('/waitingroom?' + query)
// })

router.get("/waitingroom", isAuthenticated, (request, response) => {

  console.log('----waitingroom----')
  let result = getRoomByName(request.query.room)

  let roomchat = getRoomChatByName(request.query.room)
  console.log(roomchat)

  let chats = []

  if (roomchat !== undefined) {
    chats = roomchat.chats
  }
  response.render("waitingroom", {
    roomname: result.name,
    host: result.host,
    players: result.players,
    chats: chats,
  })
})
router.get("/waitingroom", (request, response) => {
  response.redirect('/')
})

router.get("/game", isAuthenticated, (request, response) => {

  console.log('----game----')
  let result = getRoomByName(request.query.room)

  let roomchat = getRoomChatByName(request.query.room)
  
  let chats = []

  if (roomchat !== undefined) {
    chats = roomchat.chats
  }
  response.render("game", {
    roomname: result.name,
    host: result.host,
    players: result.players,
    chats: chats,
  })
})
router.get("/game", (request, response) => {
  response.redirect('/')
})


router.post("/:id", (request, response) => {
  const io = request.app.get("io");

  const { message } = request.body;
  const sender = request.session.user.username;

  io.emit("chat-message", { message, sender });
});

module.exports = router;