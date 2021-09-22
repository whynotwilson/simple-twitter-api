"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    "Tag",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      text: DataTypes.STRING,
    },
    {}
  );
  Tag.associate = function (models) {
    Tag.belongsToMany(models.Tweet, {
      through: models.Tagship,
      foreignKey: "TagId",
      as: "HashtagedTweets",
    });
  };
  return Tag;
};
