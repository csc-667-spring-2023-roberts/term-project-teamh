const db = require("./connection");

const create = (username, email, password) => {
  db.one(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
    [username, email, password]
  );
  console.log("User created");
}
  

// module.exports = {
//   create,
// };

const findByEmail = (email) => {
  db.one("SELECT * FROM users WHERE email=$1", [email]);
}
  

module.exports = {
  create,
  findByEmail,
};
