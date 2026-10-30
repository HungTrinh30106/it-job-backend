import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import CV from "../models/cv.model";
import AccountCompany from "../models/account-company.model";
import Jobs from "../models/jobs.model";
import moment from "moment";

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

export const profilePatch = async (req: AccountRequest, res: Response) => {
  try {
    req.body.avatar = req.file ? req.file.path : "";

    await AccountUser.updateOne({ _id: req.account.id }, req.body);

    res.json({
      code: "success",
      message: "Đã cập nhật",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const cvList = async (req: AccountRequest, res: Response) => {
  try {
    const email = req.account.email;

    const find = {
      email: email,
    };

    // Phân trang
    const limitItems = 2;
    let page = 1;
    if (req.query.page && parseInt(`${req.query.page}`) > 0) {
      page = parseInt(`${req.query.page}`);
    }
    const skip = (page - 1) * limitItems;
    const totalRecord = await CV.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limitItems);
    const pagination = {
      totalPage: totalPage,
      totalRecord: totalRecord,
      skip: skip,
      currentPage: page,
    };
    // Hết Phân trang

    const cvList = await CV.find(find).limit(limitItems).skip(skip).sort({
      createdAt: "desc",
    });

    if (!cvList) {
      return res.json({
        code: "error",
        message: "Không tìm thấy CV! ",
      });
    }

    const dataFinal = [];

    for (const item of cvList) {
      const jobInfo = await Jobs.findOne({ _id: item.jobId });
      const companyInfo = await AccountCompany.findOne({
        _id: jobInfo?.companyId,
      });

      if (jobInfo && companyInfo) {
        const itemFinal = {
          id: item.id,
          jobTitle: jobInfo.title,
          companyName: companyInfo.companyName,
          salaryMin: jobInfo.salaryMin,
          salaryMax: jobInfo.salaryMax,
          position: jobInfo.position,
          workingForm: jobInfo.workingForm,
          status: item.status,
          createdAt: moment(item.createdAt).format("HH:mm:ss - DD/MM/YYYY"),
        };
        dataFinal.push(itemFinal);
      }
    }

    res.json({
      code: "success",
      message: "Danh sách cv",
      cvList: dataFinal,
      pagination: pagination,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const cvDetail = async (req: AccountRequest, res: Response) => {
  try {
    const email = req.account.email;

    const account = await AccountUser.findOne({ email: email });
    if (!account) {
      return res.json({
        code: "error",
        message: "Không tìm thấy tài khoản! ",
      });
    }

    const find = {
      email: email,
      _id: req.params.id,
    };

    const cv = await CV.findOne(find);
    if (!cv) {
      return res.json({
        code: "error",
        message: "Không tìm thấy CV! ",
      });
    }

    const jobInfo = await Jobs.findOne({ _id: cv.jobId });
    const companyInfo = await AccountCompany.findOne({
      _id: jobInfo?.companyId,
    });

    if (jobInfo && companyInfo) {
      const dataFinal = {
        id: cv.id,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        fileCV: cv.fileCV,
        jobTitle: jobInfo.title,
        jobId: jobInfo.id,
        companyName: companyInfo.companyName,
        salaryMin: jobInfo.salaryMin,
        salaryMax: jobInfo.salaryMax,
        technologies: jobInfo.technologies,
        position: jobInfo.position,
        workingForm: jobInfo.workingForm,
      };
      res.json({
        code: "success",
        message: "Chi tiết cv",
        cvDetail: dataFinal,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const cvDelete = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;

    const deletedCV = await CV.findOneAndDelete({
      _id: id,
      email: req.account.email,
    });

    if (!deletedCV) {
      return res.status(404).json({
        code: "error",
        message: "Không tìm thấy CV!",
      });
    }

    return res.json({
      code: "success",
      message: "Đã xóa CV! ",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};
