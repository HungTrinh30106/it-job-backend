import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import AccountUser from "../models/account-user.model";
import AccountCompany from "../models/account-company.model";

export const verifyTokenUser = async (
  req: AccountRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.json({
        code: "error",
        message: "Vui lòng gửi kèm token",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      `${process.env.JWT_SECRET_KEY}`,
    ) as jwt.JwtPayload;
    const { id, email, type } = decoded;

    if (type != "user") {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ",
      });
      return;
    }

    const existAccount = await AccountUser.findOne({
      _id: id,
      email: email,
    });

    if (!existAccount) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ",
      });
      return;
    }

    req.account = existAccount;

    next();
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const verifyTokenCompany = async (
  req: AccountRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.json({
        code: "error",
        message: "Vui lòng gửi kèm token",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      `${process.env.JWT_SECRET_KEY}`,
    ) as jwt.JwtPayload;
    const { id, email, type } = decoded;

    if (type != "company") {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ",
      });
      return;
    }

    const existAccount = await AccountCompany.findOne({
      _id: id,
      email: email,
    });

    if (!existAccount) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ",
      });
      return;
    }

    req.account = existAccount;

    next();
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};
