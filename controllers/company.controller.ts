import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import Jobs from "../models/jobs.model";
import CityList from "../models/city-list.model";
import CV from "../models/cv.model";
import moment from "moment";

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

    const salt = await bcrypt.genSalt(10); // Tạo salt - chuỗi ngẫu nhiên có 10 kí tự
    req.body.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu

    const newRecord = new AccountCompany(req.body);
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

    const existAccount = await AccountCompany.findOne({
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
        type: "company",
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
    req.body.logo = req.file ? req.file.path : "";

    await AccountCompany.updateOne({ _id: req.account.id }, req.body);

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

export const createJobPost = async (req: AccountRequest, res: Response) => {
  try {
    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies
      ? req.body.technologies.split(", ")
      : [];
    req.body.images = [];

    for (const file of req.files as Express.Multer.File[]) {
      req.body.images.push(file.path);
    }

    const newRecord = new Jobs(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Đã tạo công việc",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const jobList = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.account.id;
    const find = {
      companyId: id,
    };

    // Phân trang
    const limitItems = 2;
    let page = 1;
    if (req.query.page && parseInt(`${req.query.page}`) > 0) {
      page = parseInt(`${req.query.page}`);
    }
    const skip = (page - 1) * limitItems;
    const totalRecord = await Jobs.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limitItems);
    const pagination = {
      totalPage: totalPage,
      totalRecord: totalRecord,
      currentPage: page,
      skip: skip,
    };
    // Hết phân trang

    const jobs = await Jobs.find(find)
      .limit(limitItems)
      .skip(skip)
      .sort({ createdAt: "desc" });

    const dataFinal = [];

    for (const item of jobs) {
      const itemFinal = {
        id: item._id,
        title: item.title,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        technologies: item.technologies,
      };
      dataFinal.push(itemFinal);
    }

    res.json({
      code: "success",
      message: "Thành công",
      jobs: dataFinal,
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

export const jobDetail = async (req: AccountRequest, res: Response) => {
  try {
    const jobId = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Jobs.findOne({ _id: jobId, companyId: companyId });

    res.json({
      code: "success",
      message: "Thành công",
      jobDetail: jobDetail,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const editJobPatch = async (req: AccountRequest, res: Response) => {
  try {
    const jobId = req.params.id;
    const companyId = req.account.id;

    const existJob = await Jobs.findOne({ _id: jobId, companyId: companyId });

    if (!existJob) {
      res.json({
        code: "error",
        message: "Công việc không tồn tại",
      });
      return;
    }

    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies
      ? req.body.technologies.split(", ")
      : [];
    req.body.images = [];

    for (const file of req.files as Express.Multer.File[]) {
      req.body.images.push(file.path);
    }

    await Jobs.updateOne({ _id: jobId }, req.body);

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

export const deleteJobDel = async (req: AccountRequest, res: Response) => {
  try {
    const jobId = req.params.id;
    const companyId = req.account.id;

    const existJob = await Jobs.findOne({ _id: jobId, companyId: companyId });

    if (!existJob) {
      res.json({
        code: "error",
        message: "Công việc không tồn tại",
      });
      return;
    }

    await Jobs.deleteOne({ _id: jobId });

    res.json({
      code: "success",
      message: "Đã xóa",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const find = {};

    // Phân trang
    let limitItems = 20;
    if (req.query.limitItem && parseInt(`${req.query.limitItem}`) > 0) {
      limitItems = parseInt(`${req.query.limitItem}`);
    }
    let page = 1;
    if (req.query.page && parseInt(`${req.query.page}`) > 0) {
      page = parseInt(`${req.query.page}`);
    }
    const skip = (page - 1) * limitItems;
    const totalRecord = await AccountCompany.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limitItems);
    const pagination = {
      totalPage: totalPage,
      totalRecord: totalRecord,
      currentPage: page,
      skip: skip,
    };
    // Hết phân trang

    const companyList = await AccountCompany.find(find)
      .limit(limitItems)
      .skip(skip)
      .sort({ createdAt: "desc" });

    const dataFinal = [];

    for (const item of companyList) {
      const city = await CityList.findOne({
        _id: item.city,
      });

      const totalJob = await Jobs.countDocuments({
        companyId: item._id.toString(),
      });

      const itemFinal = {
        id: item._id,
        logo: item.logo,
        companyName: item.companyName,
        city: city ? city.name : "",
        totalJob: totalJob,
      };
      dataFinal.push(itemFinal);
    }

    res.json({
      code: "success",
      message: "Danh sách cong ty",
      companyList: dataFinal,
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

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const existCompany = await AccountCompany.findOne({ _id: id });

    if (!existCompany) {
      res.json({
        code: "error",
        message: "Công ty không tồn tại",
      });
      return;
    }

    const city = await CityList.findOne({ _id: existCompany.city });

    // Lấy chi tiết công ty
    const companyDetail = {
      companyName: existCompany.companyName,
      logo: existCompany.logo,
      address: existCompany.address,
      city: city ? city.name : "",
      companyModel: existCompany.companyModel,
      companyEmployees: existCompany.companyEmployees,
      workingTime: existCompany.workingTime,
      workOverTime: existCompany.workOverTime,
      description: existCompany.description,
    };

    // Lấy ra danh sách công việc
    const jobs = await Jobs.find({ companyId: id }).sort({ createdAt: "desc" });

    const cityInfo = await CityList.findOne({ _id: existCompany?.city });

    let dataFinal = [];

    for (const item of jobs) {
      const itemFinal = {
        id: item._id,
        companyLogo: existCompany.logo,
        title: item.title,
        companyName: existCompany.companyName,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        cityName: cityInfo?.name,
        technologies: item.technologies,
      };
      dataFinal.push(itemFinal);
    }

    res.json({
      code: "success",
      message: "Thành công",
      companyDetail: companyDetail,
      jobList: dataFinal,
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
    const id = req.account.id;

    // Lấy ra danh sách công cv của công ty
    const jobList: any = await Jobs.find({ companyId: id });

    const idJobList = jobList?.map((item: any) => item.id);

    const find = {
      jobId: { $in: idJobList },
    };

    // Phân trang
    const limitItems = 6;
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

    const cvList = await CV.find(find)
      .limit(limitItems)
      .skip(skip)
      .sort({ createdAt: "desc" });

    const dataFinal = [];

    for (const item of cvList) {
      const jobInfo = jobList.find((job: any) => job.id == item.jobId);

      const itemFinal = {
        id: item.id,
        jobTitle: jobInfo.title,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        salaryMin: jobInfo.salaryMin,
        salaryMax: jobInfo.salaryMax,
        position: jobInfo.position,
        workingForm: jobInfo.workingForm,
        viewed: item.viewed,
        status: item.status,
        createdAt: moment(item.createdAt).format("HH:mm:ss - DD/MM/YYYY"),
      };
      dataFinal.push(itemFinal);
    }

    res.json({
      code: "success",
      message: "Thành công!",
      cvList: dataFinal,
      pagination: pagination,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!",
    });
  }
};

export const cvDetail = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const cv: any = await CV.findOne({ _id: id });
    if (!cv) {
      return res.json({
        code: "error",
        message: "Không tìm thấy CV!",
      });
    }

    const jobInfo: any = await Jobs.findOne({
      _id: cv.jobId,
      companyId: companyId,
    });
    if (!jobInfo) {
      res.json({
        code: "error",
        message: "Không tìm thấy công việc!",
      });
    }

    if (!cv.viewed) {
      await CV.updateOne(
        {
          _id: id,
        },
        {
          viewed: true,
        },
      );
    }

    const itemFinal = {
      fullName: cv.fullName,
      email: cv.email,
      phone: cv.phone,
      fileCV: cv.fileCV,
      jobTitle: jobInfo.title,
      salaryMin: jobInfo.salaryMin,
      salaryMax: jobInfo.salaryMax,
      position: jobInfo.position,
      workingForm: jobInfo.workingForm,
      technologies: jobInfo.technologies,
      jobId: jobInfo.id,
    };

    res.json({
      code: "success",
      message: "Thành công!",
      cvDetail: itemFinal,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!",
    });
  }
};

export const cvDelete = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;

    await CV.deleteOne({ _id: id });

    res.json({
      code: "success",
      message: "Đã xóa CV!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!",
    });
  }
};

export const changeStatusPatch = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;

    await CV.updateOne({ _id: id }, { status: req.body.status });

    res.json({
      code: "success",
      message: "Đã cập nhật!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!",
    });
  }
};
