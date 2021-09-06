const db = require('../models')
const Reply = db.Reply

const replyController = {
  postReply: async (req, res) => {
    try {
      let comment = req.body.comment
      if (!comment) {
        throw ('Error: The content of comment cannot be blank, failed to create comment')
      }
      comment = comment.trim()

      const reply = await Reply.create({
        UserId: req.user.id,
        TweetId: req.body.tweetId,
        comment
      })
      return res.json({
        status: 'success',
        message: 'create comment successfully',
        replyId: reply.id,
        comment: reply.comment
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

module.exports = replyController