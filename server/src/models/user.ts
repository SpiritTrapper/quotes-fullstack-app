import { Model, STRING, UUID, UUIDV4 } from "sequelize";
import sequelize from "../connectORM";

interface UserModel extends Model {
  id: string;
  email: string;
  password: string;
  fullname?: string;
}

export const User = sequelize.define<UserModel>("user", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  email: {
    type: STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: STRING,
    allowNull: false,
  },
  fullname: {
    type: STRING,
  },
});
