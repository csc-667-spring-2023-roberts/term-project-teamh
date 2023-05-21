const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../db/users");

const router = express.Router();

const SALT_ROUNDS = 10;

router.get("/signup", (_request, response) => {
  response.render("signup", { title: "Jrob's Term Project" });
});

router.post("/signup", async (request, response) => {
  const { username, email, password } = request.body;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  try {
    const userId = await Users.create(username, email, hash);
    request.session.user = userId;

    response.redirect("/");
  } catch (error) {
    console.log({ error });
    response.render("signup", {
      title: "Jrob's Term Project",
      username,
      email,
    });
  }
});

router.get("/login", (_request, response) => {
  response.render("login", { title: "Uno Game (Login)" });
});

router.post("/login", async (request, response) => {
  const { username, password } = request.body;

  try {
    const { id, email, password: hashedPassword } = await Users.findByEmail(username);
    
    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, hashedPassword.trim()).then(isValidUser => {
      if (isValidUser) {
        request.session.user = {
          id,
          username,
          email,
        };
        response.redirect("/");
      } else {
        console.log("Invalid username or password");
        // If the passwords did not match, render the login page again with an error message
        response.render("login", { title: "Uno Game (Login)", username, error: "Invalid username or password." });
      }
    }).catch(error => {
      // Catch any errors that occurred while comparing the passwords
      console.log({ error });
      response.render("login", { title: "Uno Game (Login)", username, error: "An error occurred. Please try again." });
    });

  } catch (error) {
    // Catch any errors that occurred while trying to find the user
    console.log({ error });
    response.render("login", { title: "Uno Game (Login)", username, error: "An error occurred. Please try again." });
  }
});


router.get("/logout", (request, response) => {
  request.session.destroy((error) => {
    console.log({ error });
  });

  response.redirect("/");
});

module.exports = router;
