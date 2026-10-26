import { Request, Response } from "express";
import Jobs from "../models/jobs.model";
import AccountCompany from "../models/account-company.model";

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await Jobs.findOne({ _id: id });

    if (!record) {
      res.json({
        code: "error",
        message: "Công việc không tồn tại",
      });
      return;
    }

    const companyInfo = await AccountCompany.findOne({ _id: record.companyId });

    if (!companyInfo) {
      res.json({
        code: "error",
        message: "Công việc không tồn tại",
      });
      return;
    }

    const jobDetail = {
      id: record._id,
      title: record.title,
      companyName: companyInfo.companyName,
      salaryMin: record.salaryMin,
      salaryMax: record.salaryMax,
      images: record.images,
      position: record.position,
      workingForm: record.workingForm,
      companyAddress: companyInfo.address,
      technologies: record.technologies,
      description: record.description,
      companyId: record.companyId,
      companyLogo: companyInfo.logo,
      companyModel: companyInfo.companyModel,
      companyEmployees: companyInfo.companyEmployees,
      companyWorkingTime: companyInfo.workingTime,
      companyWorkOverTime: companyInfo.workOverTime,
    };

    console.log(jobDetail);

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
