import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import bcrypt from "bcryptjs";

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
