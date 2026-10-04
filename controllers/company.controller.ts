import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";

export const registerPost = async (req: Request, res: Response) => {
  try {
    const existAccount = await AccountCompany.findOne({
      email: req.body.email,
    });

    if (existAccount) {
      res.json({
        code: "error",
        message: "Email đã tồn tại",
      });
      return;
    }

    const newRecord = new AccountCompany({
      companyName: req.body.companyName,
      email: req.body.email,
      password: req.body.password,
    });
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
