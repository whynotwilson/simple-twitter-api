const express = require("express");
const SocketServer = require("ws").Server;

const methodOverride = require("method-override");
const cors = require("cors");

const app = express();
const port = process.env.port || 3000;

app.use(methodOverride("_method"));
// cors 的預設為全開放
app.use(cors());

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = app.listen(port, () => console.log(`Listening on ${port}`));

const wss = new SocketServer({ server });
let clients = [];

wss.on("connection", (ws, req) => {
  console.log("Client connected");
  ws.UserId = req.url.slice(req.url.indexOf("UserId=") + 7);

  clients.push(ws);
  console.log(clients);

  ws.on("message", (data) => {
    console.log("receive: " + data);
    ws.send(data);
  });

  ws.on("close", () => {
    console.log("Close connected");
  });
});

module.exports = app;
require("./routes")(app);
