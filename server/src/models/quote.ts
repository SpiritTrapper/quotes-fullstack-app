import { Model, STRING, UUID, UUIDV4 } from "sequelize";
import sequelize from "../connectORM";
import { Author } from "./author";

interface QuoteModel extends Model {
  id: string;
  authorId: string;
  text: string;
}

export const Quote = sequelize.define<QuoteModel>("quote", {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  authorId: {
    type: UUID,
    references: {
      model: Author,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  text: {
    type: STRING,
    allowNull: false,
  },
});
