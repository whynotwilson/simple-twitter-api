process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../../models");
let sinon = require("sinon");
let chai = require("chai");
let should = chai.should();

const middleware = require("../../middleware");

describe("# user request", () => {
  before(async () => {
    try {
      await sinon
        .stub(middleware, "authenticated")
        .callsFake(function skipAuthenticated(req, res, next) {
          req.user = {
            id: 1,
            name: "user1",
            email: "user1@email.com",
            avatar: "avatar",
          };
          next();
        });

      // hide console.log
      sinon.stub(console, "log");

      app = require("../../app");

      await db.User.destroy({ where: {}, truncate: true });
      await db.Tweet.destroy({ where: {}, truncate: true });
      await db.User.create({ id: 1, email: "same@email.com" });
      await db.Tweet.create({
        id: 1,
        UserId: 1,
        description: "tweet 1",
      });
      await db.Tweet.create({
        id: 2,
        UserId: 1,
        description: "tweet 2",
      });
    } catch (err) {
      console.log("mocha user before All Error");
      console.log("err", err);
    }
  });

  context("#signup", () => {
    describe("when user1 signup", () => {
      it("all fields must be filled", (done) => {
        request(app)
          .post("/signup")
          .send({ name: "user1", email: "user1@email.com", password: "1" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("請輸入必填欄位");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("password === passwordCheck", (done) => {
        request(app)
          .post("/signup")
          .send({
            name: "user1",
            email: "user1@email.com",
            password: "1",
            passwordCheck: "2",
          })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("兩次輸入密碼不同");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("duplicate email", (done) => {
        request(app)
          .post("/signup")
          .send({
            name: "user1",
            email: "same@email.com",
            password: "1",
            passwordCheck: "1",
          })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("信箱重複");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("signup success", (done) => {
        request(app)
          .post("/signup")
          .send({
            name: "user1",
            email: "user1@email.com",
            password: "1",
            passwordCheck: "1",
          })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("成功註冊帳號");
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

  context("#signin", () => {
    describe("when user1 signin", () => {
      it("email and password must be filled in", (done) => {
        request(app)
          .post("/signin")
          .send({ email: "user1@email.com" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("請輸入必填欄位");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("account did not exist", (done) => {
        request(app)
          .post("/signin")
          .send({ email: "user2@email.com", password: "2" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("查無該用戶");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("password not match", (done) => {
        request(app)
          .post("/signin")
          .send({ email: "user1@email.com", password: "2" })
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("密碼錯誤");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("signin success", (done) => {
        request(app)
          .post("/signin")
          .send({ email: "user1@email.com", password: "1" })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("登入成功");
              res.body.should.have.property("token");
              res.body.should.have.property("user");
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

  context("#get", () => {
    describe("when getUser", () => {
      it("user did not exist", (done) => {
        request(app)
          .get("/users/10")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("查詢無該用戶");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("getUser successfully", (done) => {
        request(app)
          .get("/users/1")
          .then(
            function (res) {
              res.body.should.have.property("id");
              res.body.should.have.property("email");
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
    describe("when user1 update userProfile", () => {
      it("status 401 Unauthorized, throw error", (done) => {
        request(app)
          .put("/users/2")
          .then(
            function (res) {
              res.body.status.should.equal("error");
              res.body.message.should.equal("權限不足，無法更新個人資料");
              done();
            },
            (err) => {
              console.log("err", err);
              done(err);
            }
          );
      });

      it("edit user successfully", (done) => {
        request(app)
          .put("/users/1")
          .send({ name: "user1 edit", introduction: "introduction edit" })
          .then(
            function (res) {
              res.body.status.should.equal("success");
              res.body.message.should.equal("成功編輯個人資料");
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

  context("#getUserTweets", () => {
    describe("when user1 getUserTweets", () => {
      it("getUserTweets successfully", (done) => {
        request(app)
          .get("/users/1/tweets")
          .then(
            function (res) {
              chai
                .expect(res.body[0])
                .to.contain.all.keys([
                  "id",
                  "description",
                  "UserId",
                  "Replies",
                  "LikedUsers",
                ]);
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

  context("#getCurrentUser", () => {
    describe("when user1 getCurrentUser", () => {
      it("getCurrentUser successfully", (done) => {
        request(app)
          .get("/get_current_user")
          .then(
            function (res) {
              res.body.should.have.property("id");
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

  context("#getCurrentUserFollowing", () => {
    describe("when user1 getCurrentUserFollowing", () => {
      it("getCurrentUserFollowing successfully", (done) => {
        request(app)
          .get("/get_current_user_followings")
          .then(
            function (res) {
              chai
                .expect(res.body)
                .to.contain.all.keys([
                  "id",
                  "email",
                  "name",
                  "avatar",
                  "introduction",
                  "Followings",
                ]);
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
  });
});
