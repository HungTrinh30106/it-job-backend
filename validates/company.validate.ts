import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const registerPost = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    companyName: Joi.string().required().max(255).messages({
      "string.empty": "Vui lòng nhập tên công ty",
      "string.max": "Tên công ty không được vượt quá 255 ký tự",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng",
    }),
    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (/[A-Z]/.test(value) === false) {
          return helpers.error("password.uppercase");
        }
        if (/[a-z]/.test(value) === false) {
          return helpers.error("password.lowercase");
        }
        if (/[0-9]/.test(value) === false) {
          return helpers.error("password.number");
        }
        if (/[~!@#$%^&*]/.test(value) === false) {
          return helpers.error("password.special");
        }
        return value;
      })
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu",
        "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
        "password.uppercase": "Mật khẩu phải có ít nhất một ký tự in hoa",
        "password.lowercase": "Mật khẩu phải có ít nhất một ký tự in thường",
        "password.number": "Mật khẩu phải có ít nhất một ký tự số",
        "password.special": "Mật khẩu phải có ít nhất một ký tự đặc biệt",
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message,
    });
    return;
  }

  next();
};

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập mật khẩu",
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message,
    });
    return;
  }

  next();
};

export const profilePatch = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const schema = Joi.object({
    companyName: Joi.string().required().max(200).messages({
      "string.empty": "Vui lòng nhập tên công ty",
      "string.max": "Tên công ty không được vượt quá 200 ký tự",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng",
    }),
    logo: Joi.string().allow(""),
    city: Joi.string().allow(""),
    address: Joi.string().allow(""),
    companyModel: Joi.string().allow(""),
    companyEmployees: Joi.string().allow(""),
    workingTime: Joi.string().allow(""),
    workOverTime: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    description: Joi.string().allow(""),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.json({
      code: "error",
      message: error.details[0].message,
    });
    return;
  }

  next();
};
