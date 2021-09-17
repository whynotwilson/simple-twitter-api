process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../../models");
let sinon = require("sinon");
let chai = require("chai");
let should = chai.should();

const middleware = require("../../middleware");

describe("# reply request", () => {
  context("#create", () => {
    describe("when user1 comment", () => {
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
          await db.Reply.destroy({ where: {}, truncate: true });
          await db.User.create({ id: 1 });
        } catch (err) {
          console.log("mocha reply before All Error");
          console.log("err", err);
        }
      });

      it("comment can not be blank", (done) => {
        request(app)
          .post("/replies")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ comment: "" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("comment cannot be blank");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("comment successfully will show success message", (done) => {
        request(app)
          .post("/replies")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ comment: "comment" })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("create comment successfully");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      after(async () => {
        sinon.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Reply.destroy({ where: {}, truncate: true });
      });
    });
  });

  context("#put", () => {
    describe("when user1 edit comment", () => {
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
          await db.Reply.destroy({ where: {}, truncate: true });
          await db.User.create({ id: 1 });
          await db.Reply.create({
            id: 1,
            UserId: 2,
            TweetId: 1,
            comment: "reply 1, userId !== currentUser.id",
          });
          await db.Reply.create({
            id: 2,
            UserId: 1,
            TweetId: 1,
            comment: "reply 2, userId === currentUser.id",
          });
        } catch (err) {
          console.log("mocha reply before All Error");
          console.log("err", err);
        }
      });

      it("comment can not be blank", (done) => {
        request(app)
          .put("/replies/1")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ comment: "" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("comment 不能空白");
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
          .put("/replies/1")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ comment: "edit comment" })
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

      it("edit comment successfully will show success message", (done) => {
        request(app)
          .put("/replies/2")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ comment: "edit comment" })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("update reply successfully");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      after(async () => {
        sinon.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Reply.destroy({ where: {}, truncate: true });
      });
    });
  });

  context("#delete", () => {
    describe("when user1 delete comment", () => {
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
          await db.Reply.destroy({ where: {}, truncate: true });
          await db.User.create({ id: 1 });
          await db.Reply.create({
            id: 1,
            UserId: 2,
            TweetId: 1,
            comment: "reply 1, userId !== currentUser.id",
          });
          await db.Reply.create({
            id: 2,
            UserId: 1,
            TweetId: 1,
            comment: "reply 2, userId === currentUser.id",
          });
        } catch (err) {
          console.log("mocha reply before All Error");
          console.log("err", err);
        }
      });

      it("if comment did not exist, throw error", (done) => {
        request(app)
          .delete("/replies/10")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("did not exist");
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
          .delete("/replies/1")
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

      it("delete comment successfully will show success message", (done) => {
        request(app)
          .delete("/replies/2")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("delete reply successfully");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      after(async () => {
        sinon.restore();
        await db.User.destroy({ where: {}, truncate: true });
        await db.Reply.destroy({ where: {}, truncate: true });
      });
    });
  });
});
