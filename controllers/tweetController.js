const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply
const Like = db.Like

const tweetController = {
  getTweets: async (req, res) => {
    try {
      let tweets = await Tweet.findAll({
        where: {
          UserId: req.user.id
        },
        include: [
          { model: Reply, include: [User] },
          { model: User, as: 'LikedUsers' },
          {
            model: User,
            where: { id: { $col: 'tweet.UserId' } }
          }
        ]
      })

      tweets = tweets.map((tweet) => ({
        ...tweet.dataValues,
        Replies: tweet.Replies.map((reply) => ({
          ...reply.dataValues
        })),
        User: tweet.User.dataValues,
        likedCount: tweet.LikedUsers.length,
        replyCount: tweet.Replies.length
      }))

      return res.json(tweets)
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },

  postTweet: async (req, res) => {
    try {
      const tweetText = req.body.tweetText.trim()
      if (!tweetText) {
        throw ('Error: The content of the tweet cannot be blank, failed to create tweet')
      }
      let tweet = await Tweet.create({
        UserId: req.user.id,
        description: tweetText
      })

      tweet = tweet.dataValues

      return res.json({
        status: 'success',
        message: 'create tweet successfully',
        tweet
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },

  putTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id)
      if (!tweet) {
        throw ('tweet id 異常')
      }

      if (Number(req.user.id) !== Number(tweet.dataValues.UserId)) {
        throw ('權限不足，無法更新 tweet')
      }
      const description = req.body.description.trim()
      if (!description) {
        throw ('Error: The content of the tweet description cannot be blank, failed to update tweet')
      }
      tweet.update({
        description: req.body.description
      })
      return res.json({
        status: 'success',
        message: 'update tweet successfully',
        tweet: tweet.dataValues
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },

  deleteTweet: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(req.params.id)
      if (!tweet) {
        throw ('Error: This tweet did not exist, failed to delete tweet')
      }
      if (Number(req.user.id) !== Number(tweet.dataValues.UserId)) {
        throw ('權限不足，無法刪除 tweet')
      }
      tweet.destroy()
      return res.json({
        status: 'success',
        message: 'delete tweet successfully'
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },

  addLike: async (req, res) => {
    try {
      await Like.create({
        UserId: req.user.id,
        TweetId: req.params.id
      })
      return res.json({
        status: 'success',
        message: 'addLike successfully'
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
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
}

module.exports = tweetController
