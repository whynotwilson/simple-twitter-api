"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tagship = sequelize.define(
    "Tagship",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      TweetId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Tweet",
          key: "id",
        },
      },
      TagId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Tag",
          key: "id",
        },
      },
    },
    {}
  );
  Tagship.associate = function (models) {
    Tagship.belongsTo(models.Tweet);
    Tagship.belongsTo(models.Tag);
  };
  return Tagship;
};
