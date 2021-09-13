process.env.NODE_ENV = "test";

var request = require("supertest");
var app = require("./../../app");
const db = require("./../../models");
var sinon = require("sinon");
var chai = require("chai");
var should = chai.should();

describe("# token authenticated", () => {
  before(() => {
    // hide console.log
    sinon.stub(console, "log");
  });

  it("#should throw an error when token not found", () => {
    request(app)
      .get("/")
      .expect(200)
      .end(function (err, res) {
        res.body.status.should.equal("error");
        res.body.message.should.equal("請先登入");
      });
  });

  it("#should throw an error when token is invalid", () => {
    request(app)
      .get("/")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNjMxNTQzNTI0fQ.TpooKJZBlM9iAhrC3w40glsdr98wJ7Dbq1zMtY7_dx1"
      )
      .expect(401)
      .end(function (err, res) {
        res.body.status.should.equal("error");
        res.body.message.should.equal("invalid signature");
      });
  });

  after(() => {
    sinon.restore();
  });
});
