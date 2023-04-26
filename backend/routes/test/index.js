const express = require("express");
const router = express.Router();
const db = require("../../db/connection.js");

router.get("/", (_request, response) => {
  db.any(`INSERT INTO test_table ("test_string") VALUES ($1)`, [
    `Hello on ${new Date().toLocaleDateString("en-us", {
      hour: "numeric",
      minute: "numeric",
      month: "short",
      day: "numeric",
      weekday: "long",
      year: "numeric",
    })}`,
  ])
    .then((_) => db.any(`SELECT * FROM test_table`))
    .then((results) => response.json(results))
    .catch((error) => {
      console.log(error);
      response.json({ error });
    });
});

module.exports = router;
