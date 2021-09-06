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
}

module.exports = tweetController
