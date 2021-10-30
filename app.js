const express = require("express");

const methodOverride = require("method-override");
const cors = require("cors");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(methodOverride("_method"));
// cors 的預設為全開放
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("./webSocketServer").listen(app, port);

module.exports = app;
require("./routes")(app);
