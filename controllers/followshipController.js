const db = require('../models')
const Followship = db.Followship

const followshipController = {
  postFollowship: async (req, res) => {
    try {
      const [followship, isNew] = await Followship.findOrCreate({
        where: {
          followerId: req.user.id,
          followingId: req.body.followingId,
        },
        default: {
          followerId: req.user.id,
          followingId: req.body.followingId,
        },
      });

      if (!isNew) {
        throw ('Error: already Followed, failed to create followship')
      }

      return res.json({
        status: 'success',
        message: 'create followship successfully'
      })
    } catch (err) {
      console.log(err)
      res.json({
        status: 'error',
        message: err.message || err
      })
    }
  },
}

module.exports = followshipController
