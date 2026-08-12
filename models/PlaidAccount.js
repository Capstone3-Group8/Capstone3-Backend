const { DataTypes } = require("sequelize");
const db = require("../db/index");

const PlaidAccount = db.define("PlaidAccount", {
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
  account_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mask: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
  },
  subtype: {
    type: DataTypes.STRING,
  },
  current_balance: {
    type: DataTypes.DECIMAL(10, 2),
  },
  available_balance: {
    type: DataTypes.DECIMAL(10, 2),
  },
});

module.exports = PlaidAccount;
