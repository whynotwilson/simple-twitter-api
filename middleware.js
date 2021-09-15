const jwt = require("jsonwebtoken");
const db = require("./models");
const User = db.User;

const middleware = {
  authenticated: async (req, res, next) => {
    try {
      if (!req.header("Authorization")) {
        throw "請先登入";
      }
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.scope("withoutPassword").findByPk(decoded.id);
      if (!user) {
        throw "failed to authenticate user";
      }

      req.user = user.dataValues;
      req.token = token;
      next();
    } catch (err) {
      console.log(err);
      res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },
};

module.exports = middleware;
