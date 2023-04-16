const pgp = require("pg-promise")();
// const connection = pgp(process.env.DATABASE_URL);

const databaseConfig= {
  "host": "localhost",
  "port": 5432,
  "database": "unodb",
  "user": "postgres"
};
const connection = pgp(databaseConfig);

module.exports = connection;