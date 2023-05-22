const e = require("express");
const db = require("./connection");

const create = (username, email, password) => {
  db.one(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
    [username, email, password]
  ).then(data => {
    console.log("User created with ID: ", data.id);
    return data.id;
  }).catch(err => {
    console.log("Error in user creation", err);
    throw err; // throw the error to be handled by the calling function
  });
}

findByEmail = (email) => {
  return db.one("SELECT id, username, email, password FROM users WHERE email=$1", [email])
  .then(data => {
    console.log("User found with Email: ", data);
    return data;
  }).catch(err => {
    console.log("Error in user lookup", err);
    throw err; // throw the error to be handled by the calling function
  });
}


const findByUsername = (username) => {
  return db.one("SELECT id, username, email, password FROM users WHERE username=$1", [username])
  .then(data => {
    console.log("User found with ID: ", data);
    return data;
  }).catch(err => {
    console.log("Error in user lookup", err);
    throw err; // throw the error to be handled by the calling function
  });
}

  

module.exports = {
  create,
  findByEmail,
  findByUsername,
};
