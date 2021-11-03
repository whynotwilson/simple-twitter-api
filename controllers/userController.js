const db = require("../models");
const User = db.User;
const Tweet = db.Tweet;
const Reply = db.Reply;
const Message = db.Message;
const Op = require("sequelize").Op;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

const userController = {
  signIn: async (req, res) => {
    try {
      if (!req.body.email || !req.body.password) {
        throw "請輸入必填欄位";
      }

      let username = req.body.email;
      let password = req.body.password;

      let user = await User.findOne({ where: { email: username } });
      if (!user) {
        throw "查無該用戶";
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw "密碼錯誤";
      }

      // 簽發 token
      const payload = { id: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET);
      return res.json({
        status: "success",
        message: "登入成功",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  signUp: async (req, res) => {
    try {
      const { name, email, password, passwordCheck } = req.body;
      if (!name || !email || !password || !passwordCheck) {
        throw "請輸入必填欄位";
      }

      if (password !== passwordCheck) {
        throw "兩次輸入密碼不同";
      }

      const user = await User.scope("withoutPassword").findOne({
        where: { email },
      });
      if (user) {
        throw "信箱重複";
      }

      const reg = /^(?=^.{8,30}$)((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.*$/;
      if (!reg.test(password)) {
        throw `密碼強度不足</br>
        1. 至少有一個數字 </br>
        2. 至少有一個小寫英文字母 </br>
        3. 至少有一個大寫英文字母 </br>
        4. 長度在 8~30 個字母之間`;
      }

      await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
        avatar: "https://i.imgur.com/z6CF5iQ.jpeg", // default avatar
      });

      return res.json({
        status: "success",
        message: "成功註冊帳號",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  getUser: async (req, res) => {
    try {
      let user = await User.scope("withoutPassword").findByPk(req.params.id, {
        include: [
          // Tweet,
          // Reply,
          { model: User, as: "Followings" },
          { model: User, as: "Followers" },
          // { model: Tweet, as: 'LikedTweets' },
        ],
      });
      if (!user) {
        throw new Error("查詢無該用戶");
      }
      user = user.dataValues;
      return res.json(user);
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  putUser: async (req, res) => {
    try {
      if (Number(req.user.id) !== Number(req.params.id)) {
        throw "權限不足，無法更新個人資料";
      }
      const { file } = req;
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID);
        imgur.upload(file.path, async (err, img) => {
          let user = await User.scope("withoutPassword").findByPk(
            req.params.id
          );
          await user.update({
            name: req.body.name,
            introduction: req.body.introduction,
            avatar: img.data.link,
          });
          return res.json({
            status: "success",
            message: "成功編輯個人資料",
          });
        });
      } else {
        let user = await User.scope("withoutPassword").findByPk(req.params.id);
        await user.update({
          name: req.body.name,
          introduction: req.body.introduction,
        });
        return res.json({
          status: "success",
          message: "成功編輯個人資料",
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  getTweets: async (req, res) => {
    try {
      const tweets = await Tweet.findAll({
        where: {
          UserId: req.params.id,
        },
        include: [
          { model: Reply, include: [User] },
          { model: User, as: "LikedUsers" },
          User,
        ],
      });
      return res.json(tweets);
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  getFriends: async (req, res) => {
    try {
      /**
        Define friend: follow each other
      **/
      let user = await User.scope("withoutPassword").findAll({
        where: {
          id: req.user.id,
        },
        include: [{ model: User.scope("withoutPassword"), as: "Followings" }],
      });

      let followings = user[0].dataValues.Followings;
      followings = followings.map((f) => f.dataValues);

      user = await User.scope("withoutPassword").findAll({
        where: {
          id: req.user.id,
        },
        include: [{ model: User.scope("withoutPassword"), as: "Followers" }],
      });

      let followers = user[0].dataValues.Followers;
      followers = followers.map((f) => f.dataValues);

      let friends = followings.filter((following) => {
        return followers.map((f) => f.id).indexOf(following.id) !== -1;
      });

      let lastMessageListPromise;
      let lastMessageList;

      lastMessageListPromise = friends.map((friend) => {
        return Message.findAll({
          where: {
            [Op.or]: [
              { senderId: req.user.id, receiverId: friend.id },
              { senderId: friend.id, receiverId: req.user.id },
            ],
          },
          order: [["createdAt", "DESC"]],
          limit: 1,
        });
      });

      lastMessageList = await Promise.all(lastMessageListPromise);
      lastMessageList = lastMessageList.map((message) =>
        message.length ? message[0].dataValues : {}
      );

      for (let i in friends) {
        friends[i].lastMessage = lastMessageList[i].message
          ? lastMessageList[i].message
          : "";
      }

      return res.json(friends);
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      return res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  getCurrentUserFollowings: async (req, res) => {
    try {
      let [followings] = await User.scope("withoutPassword").findAll({
        where: {
          id: req.user.id,
        },
        include: [{ model: User, as: "Followings" }],
      });
      return res.json(followings);
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },
};

module.exports = userController;
