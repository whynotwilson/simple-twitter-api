const tweetController = require("../controllers/tweetController");
const replyController = require("../controllers/replyController");
const followshipController = require("../controllers/followshipController");
const userController = require("../controllers/userController");
const hashtagController = require("../controllers/hashtagController");
const chatController = require("../controllers/chatController");

const multer = require("multer");
const upload = multer({ dest: "temp/" });

const { authenticated } = require("../middleware");

module.exports = (app) => {
  app.get("/get_current_user", authenticated, userController.getCurrentUser);
  app.get(
    "/get_current_user_followings",
    authenticated,
    userController.getCurrentUserFollowings
  );

  app.get("/", authenticated, (req, res) => res.redirect("/tweets"));
  app.get("/tweets", authenticated, tweetController.getTweets);
  app.post("/tweets", authenticated, tweetController.postTweet);
  app.put("/tweets/:id", authenticated, tweetController.putTweet);
  app.delete("/tweets/:id", authenticated, tweetController.deleteTweet);
  app.post("/tweets/:id/like", authenticated, tweetController.addLike);
  app.delete("/tweets/:id/like", authenticated, tweetController.deleteLike);

  app.post("/replies", authenticated, replyController.postReply);
  app.put("/replies/:id", authenticated, replyController.putReply);
  app.delete("/replies/:id", authenticated, replyController.deleteReply);

  app.post("/followships", authenticated, followshipController.postFollowship);
  app.delete(
    "/followships/:followingId",
    authenticated,
    followshipController.deleteFollowship
  );

  app.get("/users/:id", authenticated, userController.getUser);
  app.put(
    "/users/:id",
    authenticated,
    upload.single("avatar"),
    userController.putUser
  );
  app.get("/users/:id/tweets", authenticated, userController.getTweets);
  app.get("/users/:id/friends", authenticated, userController.getFriends);

  app.get(
    "/messages/:chattingUserId",
    authenticated,
    chatController.getMessages
  );

  app.get("/hashtag/:hashtag", authenticated, hashtagController.getTweets);

  app.post("/signin", userController.signIn);
  app.post("/signup", userController.signUp);
};
