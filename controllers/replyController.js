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

  putReply: async (req, res) => {
    try {
      const comment = req.body.comment.trim()
      if (!comment) {
        throw ('comment 不能空白')
      }

      const reply = await Reply.findByPk(req.params.id)
      if (Number(req.user.id) !== Number(reply.dataValues.UserId)) {
        throw ('權限不足，無法編輯 reply')
      }
      await reply.update({ comment })

      return res.json({
        status: 'success',
        message: 'update reply successfully'
      })
    } catch (err) {
      console.log(err)
      return res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },

  deleteReply: async (req, res) => {
    try {
      const reply = await Reply.findByPk(req.params.id)
      if (!reply) {
        throw (`Error: reply id: ${req.params.id} did not exist, failed to delete reply`)
      }

      if (Number(req.user.id) !== Number(reply.dataValues.UserId)) {
        throw ('權限不足，無法刪除 reply')
      }
      reply.destroy()
      return res.json({
        status: 'success',
        message: 'delete reply successfully'
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