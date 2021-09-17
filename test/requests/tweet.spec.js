process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../../models");
let sinon = require("sinon");
let chai = require("chai");
let should = chai.should();

const middleware = require("../../middleware");

describe("# tweet request", () => {
  before(async () => {
    try {
      await sinon
        .stub(middleware, "authenticated")
        .callsFake(function skipAuthenticated(req, res, next) {
          req.user = { id: 1 };
          next();
        });

      // hide console.log
      sinon.stub(console, "log");

      app = require("../../app");

      await db.User.destroy({ where: {}, truncate: true });
      await db.Tweet.destroy({ where: {}, truncate: true });
      await db.Like.destroy({ where: {}, truncate: true });
      await db.User.create({ id: 1 });
      await db.Tweet.create({
        id: 1,
        UserId: 1,
        description: "tweet 1",
      });
      await db.Tweet.create({
        id: 2,
        UserId: 2,
        description: "tweet 2",
      });
    } catch (err) {
      console.log("mocha tweet before All Error");
      console.log("err", err);
    }
  });

  context("#get", () => {
    describe("when user1 get tweets", () => {
      it("getTweets successfully will return tweets", (done) => {
        request(app)
          .get("/tweets")
          .then(
            function (res) {
              res.body[0].should.have.property("id");
              res.body[0].should.have.property("UserId");
              res.body[0].should.have.property("description");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });
    });
  });

  context("#create", () => {
    describe("when user1 post tweet", () => {
      it("tweet can not be blank", (done) => {
        request(app)
          .post("/tweets")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ tweetText: "" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("tweet cannot be blank");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("post tweet successfully will return success message and tweet", (done) => {
        request(app)
          .post("/tweets")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ tweetText: "tweet 3" })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("create tweet successfully");
              res.body.should.have.property("tweet");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });
    });
  });

  context("#put", () => {
    describe("when user1 edit tweet", () => {
      it("404 not found, tweet did not exist, throw error", (done) => {
        request(app)
          .put("/tweets/10")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ tweetText: "edit tweet" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("tweet id 異常");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("status 401 Unauthorized, throw error", (done) => {
        request(app)
          .put("/tweets/2")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ comment: "edit tweet" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("權限不足");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("tweet can not be blank", (done) => {
        request(app)
          .put("/tweets/1")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ description: "" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("cannot be blank");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("edit tweet successfully will return success message and tweet", (done) => {
        request(app)
          .put("/tweets/1")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ description: "edit tweet 1" })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("update tweet successfully");
              res.body.should.have.property("tweet");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });
    });
  });

  context("#delete", () => {
    describe("when user1 delete tweet", () => {
      it("404 not found, tweet did not exist, throw error", (done) => {
        request(app)
          .delete("/tweets/10")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("tweet did not exist");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("status 401 Unauthorized, throw error", (done) => {
        request(app)
          .delete("/tweets/2")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("權限不足");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("delete tweet successfully will return success message", (done) => {
        request(app)
          .delete("/tweets/1")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("delete tweet successfully");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });
    });
  });

  context("#addLike", () => {
    describe("when user1 like tweet", () => {
      it("addLike tweet successfully will return success message", (done) => {
        request(app)
          .post("/tweets/1/like")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("addLike successfully");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });
    });
  });

  context("#deleteLike", () => {
    describe("when user1 unLike tweet", () => {
      it("404 not found, like did not exist, throw error", (done) => {
        request(app)
          .delete("/tweets/10/like")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("like did not exist");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("unLike tweet successfully will return success message", (done) => {
        request(app)
          .delete("/tweets/1/like")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("deleteLike successfully");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });
    });
  });

  after(async () => {
    sinon.restore();
    await db.User.destroy({ where: {}, truncate: true });
    await db.Tweet.destroy({ where: {}, truncate: true });
    await db.Like.destroy({ where: {}, truncate: true });
  });
});
