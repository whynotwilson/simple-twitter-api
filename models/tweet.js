"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define(
    "Tweet",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: DataTypes.TEXT,
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: "User",
          key: "id",
        },
      },
      tags: {
        type: DataTypes.STRING,
      },
    },
    {}
  );
  Tweet.associate = function (models) {
    Tweet.hasMany(models.Like);
    Tweet.hasMany(models.Reply);
    Tweet.belongsTo(models.User);
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: "TweetId",
      as: "LikedUsers",
    });
    Tweet.belongsToMany(models.Tag, {
      through: models.Tagship,
      foreignKey: "TweetId",
      as: "Hashtags",
    });
  };
  return Tweet;
};
