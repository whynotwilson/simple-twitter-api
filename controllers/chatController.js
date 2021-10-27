const db = require("../models");
const Message = db.Message;

const chatController = {
  getMessages: async (req, res) => {
    try {
      let sent = await Message.findAll({
        where: {
          senderId: req.user.id,
          receiverId: req.params.chattingUserId,
        },
      });

      sent = sent.map((i) => {
        return {
          ...i.dataValues,
          class: "sent",
        };
      });

      let received = await Message.findAll({
        where: {
          senderId: req.params.chattingUserId,
          receiverId: req.user.id,
        },
      });

      received = received.map((i) => {
        return {
          ...i.dataValues,
          class: "received",
        };
      });

      let messages = sent.concat(received);

      messages.sort(function (a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      res.json({ messages });
    } catch (err) {
      console.log(err);
      res.json({
        status: "error",
        message: err.message || err,
      });
    }
  },
};

module.exports = chatController;
