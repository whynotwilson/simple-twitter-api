"use strict";
const faker = require("faker");
const bcrypt = require("bcryptjs");
const axios = require("axios");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const Followships = [];
      let times = 15;
      for (let i = 2; i < 13; i++) {
        for (let j = i + 1; j < i + times; j++) {
          if (i !== j) {
            Followships.push({
              followerId: j,
              followingId: i,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
        times--;
      }
      queryInterface.bulkInsert("Followships", Followships, {});

      const Users = [];
      // API UI Faces(avatar API)
      // https://uifaces.co/api-key
      const { data } = await axios.get("https://uifaces.co/api", {
        headers: {
          "X-API-KEY": process.env.X_API_KEY,
        },
        params: { limit: 25 },
      });

      Users.push({
        id: 1,
        email: "root@example.com",
        password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
        name: "root",
        avatar: data[0].photo,
        role: "admin",
        introduction: faker.lorem.text(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      for (let i = 1; i < 25; i++) {
        Users.push({
          id: i + 1,
          email: `user${i}@example.com`,
          password: bcrypt.hashSync("12345678", bcrypt.genSaltSync(10), null),
          name: `user${i}`,
          avatar: data[i].photo,
          role: "user",
          introduction: faker.lorem.text(), // lorem = 亂數
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      queryInterface.bulkInsert("Users", Users, {});

      queryInterface.bulkInsert(
        "Replies",
        Array.from({ length: 150 }).map((d) => ({
          UserId: Math.floor(Math.random() * 22) + 2,
          TweetId: Math.floor(Math.random() * 100) + 1,
          comment: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        {}
      );

      const Likes = [];
      for (let i = 2; i < 15; i++) {
        let j = i;
        while (j < 15) {
          Likes.push({
            UserId: j,
            TweetId: i,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          j++;
        }
      }
      queryInterface.bulkInsert("Likes", Likes, {});

      return queryInterface.bulkInsert(
        "Tweets",
        Array.from({ length: 200 }).map((item, index) => ({
          id: index + 1,
          description: faker.lorem.text(),
          UserId: Math.floor(Math.random() * 22) + 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        {}
      );
    } catch (err) {
      console.log(err);
    }
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete("Tweets", null, {});
    queryInterface.bulkDelete("Followships", null, {});
    queryInterface.bulkDelete("Likes", null, {});
    queryInterface.bulkDelete("Replies", null, {});
    return queryInterface.bulkDelete("Users", null, {});
  },
};
