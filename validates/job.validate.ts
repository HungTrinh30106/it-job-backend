import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const applyPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    jobId: Joi.string().required().messages({
      "string.empty": "Vui lòng nhập id của công việc",
      "any.required": "Vui lòng nhập id của công việc",
    }),
    fullName: Joi.string().required().min(5).max(50).messages({
      "string.empty": "Vui lòng nhập họ tên",
      "string.min": "Họ tên phải có ít nhất 5 ký tự",
      "string.max": "Họ tên không được vượt quá 50 ký tự",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Vui lòng nhập email",
      "string.email": "Email không đúng định dạng",
    }),
    phone: Joi.string()
      .required()
      .custom((value, helpers) => {
        if (
          /^(0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/.test(
            value,
          ) === false
        ) {
          return helpers.error("phone.valid");
        }
        return value;
      })
      .messages({
        "string.empty": "Vui lòng nhập số điện thoại",
        "phone.valid": "Vui lòng nhập định dạng số điện thoại",
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
