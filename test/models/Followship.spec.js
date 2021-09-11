process.env.NODE_ENV = "test";

var chai = require("chai");
chai.use(require("sinon-chai"));

const {
  sequelize,
  dataTypes,
  checkModelName,
  checkPropertyExists,
  checkUniqueIndex,
} = require("sequelize-test-helpers");

const db = require("../../models");
const FollowshipModel = require("../../models/followship");

describe("# Followship Model", () => {
  before((done) => {
    done();
  });

  const Followship = FollowshipModel(sequelize, dataTypes);
  const followship = new Followship();
  checkModelName(Followship)("Followship");

  context("properties", () => {
    ["followerId", "followingId"].forEach(checkPropertyExists(followship));
  });
});
