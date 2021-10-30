const express = require("express");

const methodOverride = require("method-override");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const ws_port = process.env.ws_port || 3001;

const http = require("http");
const server = http.createServer(app);

app.use(methodOverride("_method"));
// cors 的預設為全開放
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("./webSocketServer").listen(server, port, ws_port);

module.exports = app;
require("./routes")(app);
