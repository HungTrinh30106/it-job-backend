import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import jwt from "jsonwebtoken";
import AccountCompany from "../models/account-company.model";

export const check = async (req: Request, res: Response) => {
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

    // Tìm user
    if (type == "user") {
      const existAccountUser = await AccountUser.findOne({
        _id: id,
        email: email,
      });

      if (existAccountUser) {
        const infoUser = {
          id: existAccountUser._id,
          email: existAccountUser.email,
          fullName: existAccountUser.fullName,
          avatar: existAccountUser.avatar,
          phone: existAccountUser.phone,
        };

        res.json({
          code: "success",
          message: "Thành công",
          infoUser: infoUser,
        });
        return;
      }
    }

    // Tìm công ty
    else if (type == "company") {
      const existAccountCompany = await AccountCompany.findOne({
        _id: id,
        email: email,
      });

      if (existAccountCompany) {
        const infoCompany = {
          id: existAccountCompany._id,
          email: existAccountCompany.email,
          companyName: existAccountCompany.companyName,
          logo: existAccountCompany.logo,
          city: existAccountCompany.city,
          address: existAccountCompany.address,
          companyModel: existAccountCompany.companyModel,
          companyEmployees: existAccountCompany.companyEmployees,
          workingTime: existAccountCompany.workingTime,
          workOverTime: existAccountCompany.workOverTime,
          phone: existAccountCompany.phone,
          description: existAccountCompany.description,
        };

        res.json({
          code: "success",
          message: "Thành công",
          infoCompany: infoCompany,
        });
        return;
      }
    }

    // Nếu lỗi
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa",
    });
  } catch (error) {
    console.log(error);
    res.clearCookie("token");
    res.json({
      code: "error",
      message: "Token không hợp lệ",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.json({
      code: "success",
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};
