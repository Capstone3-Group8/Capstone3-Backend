const { DataTypes } = require("sequelize");
const db = require("../db/index");

const Category = db.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  type: {
    type: DataTypes.ENUM("income", "expense"),
    allowNull: false,
  },
});

module.exports = Category;
