import config from "config";
import bodyParser from "body-parser";
import compression from "compression";
import express, { Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import sessionConnect from "connect-session-sequelize";
import { Error } from "sequelize";
import sequelize from "./connectORM";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  checkTokenValidity,
  checkValidation,
  errorHandler,
  Errors,
  validationHandlers,
} from "./helperFunctions";
import { User } from "./models/user";
import { Token, TokenModel } from "./models/token";
import { Author } from "./models/author";
import { Quote } from "./models/quote";

// types
type QueryReturnType = Promise<Response | void>;

// constants
export const ENTITY_GET_DELAY = 5000;
const SESSION_COOKIES_LIFETIME = 30 * 24 * 60 * 60 * 1000; // 30 days
const HASH_SALT_R0UNDS = 10;
const USER_TOKEN_EXPIRES_IN = "2h";

// create the express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(compression());

// db connection
const SequelizeStore = sessionConnect(session.Store);
app.use(
  session({
    store: new SequelizeStore({
      db: sequelize,
    }),
    secret: config.get("secret"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: SESSION_COOKIES_LIFETIME,
    },
  })
);

// foreign keys
User.hasMany(Token, { foreignKey: "userId" });
Token.belongsTo(User, { foreignKey: "userId" });
Author.hasMany(Quote, { foreignKey: "authorId" });
Quote.belongsTo(Author, { foreignKey: "authorId" });

// handle user registration
app.post(
  "/register",
  validationHandlers,
  async (req: Request, res: Response): QueryReturnType => {
    checkValidation(req, res);
    const { email, password, fullname } = req.body;
    const hash = await bcrypt.hash(password, HASH_SALT_R0UNDS);

    try {
      await User.create({
        id: uuidv4(),
        email: email.trim(),
        password: hash,
        fullname: fullname.trim(),
      });

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (errors) {
      errorHandler(res, errors as Errors);
    }
  }
);

// handle user authentication
app.post(
  "/login",
  validationHandlers,
  async (req: Request, res: Response): QueryReturnType => {
    checkValidation(req, res);
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect" });
    }

    const token = jwt.sign({ userId: user.id }, config.get("secret"), {
      expiresIn: USER_TOKEN_EXPIRES_IN,
    });

    try {
      await Token.create({
        userId: user.id,
        token,
      });

      res.status(200).json({
        success: true,
        data: { token },
      });
    } catch (errors) {
      errorHandler(res, errors as Errors);
    }
  }
);

// create new quote
app.post("/create", async (req: Request, res: Response): QueryReturnType => {
  checkValidation(req, res);
  const { name, quote, token } = req.body;
  await checkTokenValidity(res, token);

  try {
    const newAuthor = await Author.create({
      id: uuidv4(),
      name: name.trim(),
    });

    await Quote.create({
      id: uuidv4(),
      authorId: newAuthor.id,
      text: quote.trim(),
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (errors) {
    errorHandler(res, errors as Errors);
  }
});

// get public info
app.get("/info", async (req: Request, res: Response): QueryReturnType => {
  try {
    res.status(200).json({
      success: true,
      data: {
        info: "Some information about the <b>company</b>.",
      },
    });
  } catch (errors) {
    errorHandler(res, errors as Errors);
  }
});

// get simple user information for current authenticated user
app.get("/profile", async (req: Request, res: Response): QueryReturnType => {
  try {
    const validToken = (await checkTokenValidity(
      res,
      req.query.token as string
    )) as TokenModel;

    const user = await User.findOne({ where: { id: validToken.userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, data: { message: "User not found" } });
    }

    return res.json({
      success: true,
      data: { fullname: user.fullname, email: user.email },
    });
  } catch (errors) {
    errorHandler(res, errors as Errors);
  }
});

// get random author information
app.get("/author", async (req: Request, res: Response): QueryReturnType => {
  try {
    await checkTokenValidity(res, req.query.token as string);

    setTimeout(async (): QueryReturnType => {
      try {
        const authors = await Author.findAll();

        if (authors) {
          const randomAuthorCalculation = Math.floor(
            Math.random() * authors.length
          );
          const randomAuthor = authors[randomAuthorCalculation];

          return res.status(200).json({
            success: true,
            data: {
              authorId: randomAuthor.id,
              name: randomAuthor.name,
            },
          });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "No authors found" });
        }
      } catch (errors) {
        errorHandler(res, errors as Errors);
      }
    }, ENTITY_GET_DELAY);
  } catch (errors) {
    errorHandler(res, errors as Errors);
  }
});

// get random quote from the author
app.get("/quote", async (req: Request, res: Response): QueryReturnType => {
  const { token, authorId } = req.query;

  if (!authorId) {
    return res
      .status(400)
      .json({ success: false, message: "Provide author id" });
  }

  try {
    await checkTokenValidity(res, token as string);

    setTimeout(async (): QueryReturnType => {
      try {
        const quote = await Quote.findOne({
          where: { authorId },
          order: sequelize.random(),
        });

        if (quote) {
          return res.status(200).json({
            success: true,
            data: {
              authorId: quote.authorId,
              quoteId: quote.id,
              quote: quote.text,
            },
          });
        } else {
          return res
            .status(404)
            .json({ success: false, message: "No quotes found" });
        }
      } catch (errors) {
        errorHandler(res, errors as Errors);
      }
    }, ENTITY_GET_DELAY);
  } catch (errors) {
    errorHandler(res, errors as Errors);
  }
});

// sign out the user from the service
app.delete("/logout", async (req: Request, res: Response): QueryReturnType => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    const deletedToken = await Token.destroy({ where: { token } });
    if (!deletedToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, please provide a valid token",
      });
    }

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (errors) {
    errorHandler(res, errors as Errors);
  }
});

async function start() {
  await sequelize.sync();

  try {
    const port = config.get("port") || 5000;
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  } catch (e) {
    const error = e as Error;
    console.log("Server error: ", error.message);
    process.exit(1);
  }
}

start();

module.exports = app; // for testing
