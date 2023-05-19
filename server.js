const path = require("path");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const express = require("express");
const session = require('express-session');
require("dotenv").config();

const app = express();
const testRoutes = require("./backend/routes/test/index.js");
const pgSession = require("connect-pg-simple")(session);
const db = require("./backend/db/connection.js");
const initSockets = require("./backend/sockets/init.js");

const oneDay = 1000 * 60 * 60 * 24;
const sessionMiddleware = session({
  store: new pgSession({ 
    pgPromise: db,
    createTableIfMissing: true
  }),
  secret: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: oneDay },
});
    
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("views", path.join(__dirname, "backend", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "backend", "static")));

const PORT = process.env.PORT || 3000;

app.use(sessionMiddleware);

app.use("/test", testRoutes);
const rootRoutes = require("./backend/routes/root");
app.use("/", rootRoutes);
const authRoutes = require("./backend/routes/authentication");
app.use("/auth", authRoutes);

const server = initSockets(app, sessionMiddleware);
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use((request, response, next) => {
  next(createError(404));
});

if (process.env.NODE_ENV === "development") {
  const livereload = require("livereload");
  const connectLiveReload = require("connect-livereload");

  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, "backend", "static"));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLiveReload());
}

