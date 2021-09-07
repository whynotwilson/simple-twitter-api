"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      avatar: DataTypes.STRING,
      introduction: DataTypes.TEXT,
      role: DataTypes.STRING,
    },
    {
      scopes: {
        withoutPassword: {
          attributes: { exclude: ["password"] },
        },
      },

      // 預設排除 password 屬性，但會導致登入功能失效(無法使用 password 屬性)
      // defaultScope: {
      //   attributes: { exclude: ['password'] },
      // },
    }
  );

  User.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  User.associate = function (models) {
    User.hasMany(models.Like);
    User.hasMany(models.Reply);
    User.hasMany(models.Tweet);
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: "followingId",
      as: "Followers",
    });
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: "followerId",
      as: "Followings",
    });
    User.belongsToMany(models.Tweet, {
      through: models.Like,
      foreignKey: "UserId",
      as: "LikedTweets",
    });
  };
  return User;
};
