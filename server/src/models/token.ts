import { Model, STRING, UUID } from "sequelize";
import sequelize from "../connectORM";
import { User } from "./user";

export interface TokenModel extends Model {
  userId: string;
  token: string;
}

export const Token = sequelize.define<TokenModel>("token", {
  userId: {
    type: UUID,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  token: {
    type: STRING,
    unique: true,
    allowNull: false,
  },
});
