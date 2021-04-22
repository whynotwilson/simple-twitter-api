'use strict';
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    TweetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Tweet',
        key: 'id'
      }
    }
  }, {});
  Like.associate = function (models) {
    Like.belongsTo(models.User)
    Like.belongsTo(models.Tweet)
  };
  return Like;
};