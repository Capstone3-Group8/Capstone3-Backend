const { DataTypes } = require("sequelize");
const db = require("../db/index");

const PlaidTransaction = db.define("PlaidTransaction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  account_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merchant_name: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  pending: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = PlaidTransaction;
