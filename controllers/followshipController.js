const db = require("../models");
const Followship = db.Followship;
const User = db.User;

const followshipController = {
  postFollowship: async (req, res) => {
    try {
      const followerId = Number(req.user.id);
      const followingId = Number(req.body.followingId);

      if (followerId === followingId) {
        throw "Error: can not follow self, failed to create followship";
      }

      const user = await User.findByPk(followingId);
      if (!user) {
        throw "Error: user doesn't exist, failed to create followship";
      }

      const [followship, isNew] = await Followship.findOrCreate({
        where: {
          followerId,
          followingId,
        },
        default: {
          followerId,
          followingId,
        },
      });

      if (!isNew) {
        throw "Error: already Followed, failed to create followship";
      }

      return res.json({
        status: "success",
        message: "create followship successfully",
      });
    } catch (err) {
      console.log(err);
      res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },

  deleteFollowship: async (req, res) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.body.followerId,
          followingId: req.params.followingId,
        },
      });
      if (!followship) {
        throw "Error: this followship did not exist, failed to deleteFollowship";
      }
      followship.destroy();

      return res.json({
        status: "success",
        message: "delete followship successfully",
      });
    } catch (err) {
      console.log(err);
      res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },
};

module.exports = followshipController;
