const { DataTypes } = require("sequelize");
const db = require("../db/index");

const PlaidItem = db.define("PlaidItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  item_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = PlaidItem;
