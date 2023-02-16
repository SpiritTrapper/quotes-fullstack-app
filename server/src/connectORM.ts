import config from "config";
import { Sequelize } from "sequelize";

export default new Sequelize(
  config.get("db-name"),
  config.get("db-user-name"),
  config.get("db-password"),
  {
    host: config.get("db-host"),
    dialect: "postgres",
    storage: "./session.postgres",
    define: {
      timestamps: false,
    },
    dialectOptions: {
      bigNumberStrings: true,
    },
  }
);
