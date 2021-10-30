const db = require("../models");
const Sequelize = require("sequelize");
const Tweet = db.Tweet;
const User = db.User;
const Reply = db.Reply;
const Like = db.Like;
const Tag = db.Tag;
const Tagship = db.Tagship;

const tweetController = {
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll({
        where: {
          UserId: req.user.id,
        },
        include: [
          { model: Reply, include: [User] },
          { model: User, as: "LikedUsers" },
          {
            model: User,
            where: { id: { $col: "tweet.UserId" } },
          },
        ],
      });

      tweets = tweets.map((tweet) => ({
        ...tweet.dataValues,
        Replies: tweet.Replies.map((reply) => ({
          ...reply.dataValues,
        })),
        User: tweet.User.dataValues,
        likedCount: tweet.LikedUsers.length,
        replyCount: tweet.Replies.length,
      }));

      return res.json(tweets);
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  postTweet: async (req, res) => {
    // https://stackoverflow.com/questions/62273766/typeerror-sequelize-transaction-is-not-a-function
    // https://codertw.com/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80/662169/

    // let databaseConfig = require("./../config/config.json")[
    //   process.env.NODE_ENV
    // ];

    // const sequelize = new Sequelize(databaseConfig);
    // const t = await sequelize.transaction();

    try {
      console.log("postTweet");
      const tweetText = req.body.tweetText.trim();
      if (!tweetText) {
        throw "Error: The content of the tweet cannot be blank, failed to create tweet";
      }

      let { tags } = req.body;
      tags = [...new Set(tags)];

      let tagsPromises;
      let tagsResult;

      if (tags.length) {
        tagsPromises = tags.map((tag) => {
          return Tag.findOrCreate({
            where: {
              text: tag,
            },
            // transaction: t,
          });
        });

        tagsResult = await Promise.all(tagsPromises);
      }

      let tweet = await Tweet.create(
        {
          UserId: req.user.id,
          description: tweetText,
        }
        // { transaction: t }
      );

      tweet = tweet.dataValues;

      if (tags.length) {
        let tagShipPromises = tags.map((tag, index) => {
          return Tagship.create(
            {
              TweetId: tweet.id,
              TagId: tagsResult[index][0].id,
            }
            // { transaction: t }
          );
        });

        await Promise.all(tagShipPromises);
      }

      // await t.commit();

      if (tags.length) {
        const tagsId = tagsResult.map((tag) => {
          return tag[0].dataValues.id;
        });

        return res.json({
          status: "success",
          message: "create tweet successfully",
          tweet,
          tagsId,
        });
      } else {
        return res.json({
          status: "success",
          message: "create tweet successfully",
          tweet,
        });
      }
    } catch (err) {
      await t.rollback();
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  putTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id);
      if (!tweet) {
        throw "tweet id 異常";
      }

      if (Number(req.user.id) !== Number(tweet.dataValues.UserId)) {
        throw "權限不足，無法更新 tweet";
      }
      const description = req.body.description.trim();
      if (!description) {
        throw "Error: The content of the tweet description cannot be blank, failed to update tweet";
      }
      tweet.update({
        description: req.body.description,
      });
      return res.json({
        status: "success",
        message: "update tweet successfully",
        tweet: tweet.dataValues,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  deleteTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id);
      if (!tweet) {
        throw "Error: This tweet did not exist, failed to delete tweet";
      }
      if (Number(req.user.id) !== Number(tweet.dataValues.UserId)) {
        throw "權限不足，無法刪除 tweet";
      }
      tweet.destroy();
      return res.json({
        status: "success",
        message: "delete tweet successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  addLike: async (req, res) => {
    try {
      await Like.create({
        UserId: req.user.id,
        TweetId: req.params.id,
      });
      return res.json({
        status: "success",
        message: "addLike successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  deleteLike: async (req, res) => {
    try {
      const like = await Like.findOne({
        where: {
          UserId: req.user.id,
          TweetId: req.params.id,
        },
      });

      if (!like) {
        throw "Error: This like did not exist, failed to delete like";
      }

      await like.destroy();
      return res.json({
        status: "success",
        message: "deleteLike successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },
};

module.exports = tweetController;
