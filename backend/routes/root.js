const express = require("express");
const router = express.Router();

// middleware to test if authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) next();
  else next("route");
}

// a middleware function with no mount path. This code is executed for every request to the router
router.use((request, response, next) => {
  console.log("Time:", Date.now());
  if (!request.session.user) {
    response.header(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.header("Expires", "-1");
    response.header("Pragma", "no-cache");
  }
  next();
});

router.get("/", isAuthenticated, (request, response) => {
  const name = "person";
  response.render("home", {
    title: "Welcome to Uno!",
    user: request.session.user,
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

module.exports = router;
