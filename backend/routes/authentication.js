const express = require("express");
const bcrypt = require("bcrypt");
const Users = require("../../db/users.js");

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
    const { id } = await Users.create(username, email, hash);
    request.session.user = {
      id,
      username,
      email,
    };

    response.redirect("/");
  } catch (error) {
    console.log({ error });
    response.render("register", {
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
  const { email, password } = request.body;

  try {
    const { id, username, password: hash } = await Users.findByEmail(email);
    const isValidUser = await bcrypt.compare(password, hash);

    if (isValidUser) {
      request.session.user = {
        id,
        username,
        email,
      };

      response.redirect("/");
    } else {
      throw "Credentials invalid";
    }
  } catch (error) {
    console.log({ error });

    response.render("login", { title: "Uno Game (Login)", email });
  }
});

router.get("/logout", (request, response) => {
  request.session.destroy((error) => {
    console.log({ error });
  });

  response.redirect("/");
});

module.exports = router;