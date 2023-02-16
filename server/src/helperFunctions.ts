import { check, validationResult } from "express-validator";
import { Request, Response } from "express";
import { Error } from "sequelize";
import { Token, TokenModel } from "./models/token";

export interface Errors extends Error {
  errors: Error[];
}

const MIN_PASSWORD_LENGTH = 8;

// validation handlers
export const validationHandlers = [
  check("email").isEmail().withMessage("Email must be valid"),
  check("password")
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    ),
];

// check for validation errors
export const checkValidation = (
  req: Request,
  res: Response
): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({
        message: error.msg,
      })),
    });
  }
};

// set error handler
export const errorHandler = (res: Response, errorsList: Errors): Response => {
  return res.status(400).json({
    success: false,
    errors: errorsList.errors.map((error: Error) => ({
      message: error.message.charAt(0).toUpperCase() + error.message.slice(1),
    })),
  });
};

// check token validity
export const checkTokenValidity = async (
  res: Response,
  token?: string
): Promise<Response | TokenModel> => {
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  const validToken = await Token.findOne({ where: { token } });
  if (!validToken) {
    return res.status(401).json({
      success: false,
      data: {
        message: "Unauthorized, please provide a valid token",
      },
    });
  } else {
    return validToken;
  }
};
