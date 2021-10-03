const db = require("../models");
const Tweet = db.Tweet;
const User = db.User;
const Reply = db.Reply;
const Like = db.Like;
const Tag = db.Tag;
const Tagship = db.Tagship;

const hashtagController = {
  getTweets: async (req, res) => {
    try {
      let { hashtag } = req.params;

      let tag = await Tag.find({
        where: {
          text: hashtag,
        },
        include: [
          {
            model: Tweet,
            as: "HashtagedTweets",
            include: [
              { model: User.scope("withoutPassword") },
              { model: Reply, include: [User] },
              { model: User, as: "LikedUsers" },
            ],
          },
        ],
      });

      if (!tag) {
        throw new Error("this tag is not exist");
      }

      let hashtagedTweets = tag.HashtagedTweets.map((tweet) => ({
        ...tweet.dataValues,
        Replies: tweet.Replies.map((reply) => ({
          ...reply.dataValues,
        })),
        User: tweet.User.dataValues,
        likedCount: tweet.LikedUsers.length,
        replyCount: tweet.Replies.length,
      }));

      return res.json({
        tag: {
          id: tag.id,
          text: tag.text,
        },
        hashtagedTweets,
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

module.exports = hashtagController;
