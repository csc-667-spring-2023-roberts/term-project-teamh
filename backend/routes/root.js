const express = require("express");
const url = require('url');
const router = express.Router();

// middleware to test if authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) next()
  else next("route")
}

// a middleware function with no mount path. This code is executed for every request to the router
router.use((request, response, next) => {
  console.log("Time:", Date.now())
  if (!request.session.user) {
    console.log('session timeout')
    response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    response.header('Expires', '-1')
    response.header('Pragma', 'no-cache')
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

router.get("/joinGame", (_request, response) => {
  response.render("joinGame", { title: "Join Game" });
});



router.get("/", function (_request, response) {
  response.render("loggedOutHome", {});
});





router.post(
  "/login",
  express.urlencoded({ extended: false }),
  function (request, response) {
    request.session.regenerate(function (err) {
      if (err) next(err);

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
)

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

  response.redirect(url.format({
    pathname: '/waitingroom',
    query: {room: request.body.roomname},
    protocol: 'http'
  }))
})
router.post("/newgame", (request, response) => {
  response.redirect('/')
})

router.get("/joingame", (request, response) => {

  let result = rooms.find(e => {
    console.log(e)
    console.log(request.query.room)
    if (e.name === request.query.room) 
      console.log('find')
    return e.name === request.query.room
  })

  result.players.push({name:request.session.user})

  response.redirect(url.format({
    pathname: '/waitingroom',
    query: request.query,
    protocol: 'http'
  }))
})

router.get("/waitingroom", isAuthenticated, (request, response) => {

  console.log('----waitingroom----')
  let result = rooms.find(e => {
    if (e.name === request.query.room) 
      console.log('find')
    return e.name === request.query.room
  })
  let roomchat = roomchats.find(e => {
    if (e.name === request.query.room) 
      console.log('find')
    return e.name === request.query.room
  })
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

  let result = rooms.find(e => {
    console.log(e)
    console.log(request.query.room)
    if (e.name === request.query.room) 
      console.log('find')
    return e.name === request.query.room
  })
  
  response.render("game", {
    roomname: result.name,
    host: result.host,
    players: result.players,
  })
})
router.get("/game", (request, response) => {
  response.redirect('/')
})

module.exports = router;
