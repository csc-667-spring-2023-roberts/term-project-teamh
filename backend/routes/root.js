const express = require("express");
const router = express.Router();

// middleware to test if authenticated
function isAuthenticated (req, res, next) {
  if (req.session.user) next()
  else next('route')
}

// a middleware function with no mount path. This code is executed for every request to the router
router.use((request, response, next) => {
  console.log('Time:', Date.now())
  if (!request.session.user) {
    response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.header('Expires', '-1');
    response.header('Pragma', 'no-cache');
  } 
  next()
})

router.get("/", isAuthenticated, (request, response) => {

  const name = "person";
  response.render("home", {
      title: "Hi World!",
      user: request.session.user,
      message: "Our first template.",
  });

});

router.get('/', function (request, response) {
  const name = "person";
  response.render("home", {
      title: "Hi World!",
      user: request.session.user,
      message: "Our first template.",
  });
})

router.get('/login', function (request, response) {
  response.render("login", {
  });
})

router.get('/signup', function (request, response) {
  response.render("signup", {
    title: "Hi World!",
  });
})

router.post('/login', express.urlencoded({ extended: false }), function (request, response) {
  
  request.session.regenerate(function (err) {
    if (err) next(err)

    // store user information in session, typically a user id
    request.session.user = request.body.user

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    request.session.save(function (err) {
      if (err) return next(err)
      response.redirect('/')
    })
  })
})

// Logout page
router.get("/logout", (request, response) => {
  response.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  response.header('Expires', '-1');
  response.header('Pragma', 'no-cache');
  request.session.destroy();
  response.render("logout", {
    title: "Logout",
    message: "Your are logged out",
  });
});

module.exports = router;