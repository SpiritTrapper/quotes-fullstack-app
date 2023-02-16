import { Model, STRING, UUID, UUIDV4 } from "sequelize";
import sequelize from "../connectORM";

interface AuthorModel extends Model {
  id: string;
  name: string;
}

export const Author = sequelize.define<AuthorModel>("author", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  name: {
    type: STRING,
    allowNull: false,
  },
});
