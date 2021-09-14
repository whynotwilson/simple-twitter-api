process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("./../../models");
let sinon = require("sinon");
let chai = require("chai");
let should = chai.should();

const middleware = require("../../middleware");

describe("# followship request", () => {
  context("#create", () => {
    describe("when user1 wants to follow user2", () => {
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

          app = require("./../../app");
          await db.User.destroy({ where: {}, truncate: true });
          await db.Followship.destroy({ where: {}, truncate: true });
          await db.User.create({ id: 1 });
          await db.User.create({ id: 2 });
        } catch (err) {
          console.log("mocha before All Error");
          console.log("err", err);
        }
      });

      it("can not follow self", (done) => {
        request(app)
          .post("/followships")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ followingId: 1 })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("can not follow self");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("when user doesn't exist, throw error", (done) => {
        request(app)
          .post("/followships")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ followingId: 11111 })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("user doesn't exist");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("follow successfully will show success message", function (done) {
        request(app)
          .post("/followships")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ followingId: 2 })
          .then(
            function (res) {
              console.log("res.body", res.body);
              res.body.status.should.equal("success");
              res.body.message.should.equal("create followship successfully");
              done();
            },
            (err) => {
              console.log("err", err);
            }
          );
      });

      it("when user already Followed, throw error", (done) => {
        request(app)
          .post("/followships")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ followingId: 2 })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("already Followed");
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
        await db.Followship.destroy({ where: {}, truncate: true });
      });
    });
  });

  context("#delete", () => {
    describe("when user1 wants to cancel follow user2", () => {
      before(async () => {
        try {
          await sinon
            .stub(middleware, "authenticated")
            .callsFake(function skipAuthenticated(req, res, next) {
              next();
            });

          // hide console.log
          sinon.stub(console, "log");

          app = require("./../../app");
          await db.User.destroy({ where: {}, truncate: true });
          await db.Followship.destroy({ where: {}, truncate: true });
          await db.User.create({ id: 1 });
          await db.User.create({ id: 2 });
          await db.Followship.create({
            id: 1,
            followerId: 1,
            followingId: 2,
          });
        } catch (err) {
          console.log("mocha followship before All Error");
          console.log("err", err);
        }
      });

      it("if followship did not exist, throw error", (done) => {
        request(app)
          .delete("/followships/10")
          .set("Accept", "application/x-www-form-urlencoded")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.includes("followship did not exist");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("cancel follow successfully will show success message", (done) => {
        request(app)
          .delete("/followships/2")
          .set("Accept", "application/x-www-form-urlencoded")
          .send({ followerId: 1 })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("delete followship successfully");
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
        await db.Followship.destroy({ where: {}, truncate: true });
      });
    });
  });
});
