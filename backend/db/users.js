const db = require("./connection");

const create = (username, email, password) =>
  db.one(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
    [username, email, password]
  );

module.exports = {
  create,
};

const findByEmail = (email) =>
  db.one("SELECT * FROM users WHERE email=$1", [email]);

module.exports = {
  create,
  findByEmail,
};