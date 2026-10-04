import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerPost = async (req: Request, res: Response) => {
  try {
    const existAccount = await AccountUser.findOne({
      email: req.body.email,
    });

    if (existAccount) {
      res.json({
        code: "error",
        message: "Email đã tồn tại",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10); // Tạo salt - chuỗi ngẫu nhiên có 10 kí tự
    req.body.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu

    const newRecord = new AccountUser(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existAccount = await AccountUser.findOne({
      email: email,
    });

    if (!existAccount) {
      res.json({
        code: "error",
        message: "Email không tồn tại",
      });
      return;
    }

    const validPassword = await bcrypt.compare(
      password,
      `${existAccount.password}`,
    );

    if (!validPassword) {
      res.json({
        code: "error",
        message: "Sai mật khẩu",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: existAccount._id,
        email: existAccount.email,
        type: "user",
      },
      `${process.env.JWT_SECRET_KEY}`,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 3, // 3 ngày
      httpOnly: true, // Chỉ cho phép server truy cập cookie
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Nếu là none thì cho phép gửi cookie qua các domain khác nhau, nếu là lax thì chỉ cho phép gửi cookie qua cùng domain
      secure: process.env.NODE_ENV === "production" ? true : false, // Nếu là true thì chỉ cho phép gửi cookie qua HTTPS, nếu là false thì cho phép gửi cookie qua HTTP và HTTPS
    });

    res.json({
      code: "success",
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};
