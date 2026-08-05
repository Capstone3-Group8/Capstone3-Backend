const { DataTypes } = require("sequelize");
const db = require("../db/index");

const Transactions = db.define("Transaction", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    
});
