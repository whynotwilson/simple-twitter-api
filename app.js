const express = require("express");

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;
require("./routes")(app);
