import { Request, Response } from "express";
import Jobs from "../models/jobs.model";
import AccountCompany from "../models/account-company.model";
import CityList from "../models/city-list.model";

export const search = async (req: Request, res: Response) => {
  try {
    const dataFinal: any = [];

    if (Object.keys(req.query).length > 0) {
      const find: any = {};

      if (req.query.language) {
        find.technologies = req.query.language;
      }

      const jobs = await Jobs.find(find).sort({ createdAt: "desc" });

      for (const item of jobs) {
        const companyInfo = await AccountCompany.findOne({
          _id: item.companyId,
        });
        const cityInfo = await CityList.findOne({ _id: companyInfo?.city });

        if (companyInfo && cityInfo) {
          const itemFinal = {
            id: item._id,
            companyLogo: companyInfo.logo,
            title: item.title,
            comanyName: companyInfo.companyName,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            position: item.position,
            workingForm: item.workingForm,
            cityName: cityInfo.name,
            technologies: item.technologies,
          };
          dataFinal.push(itemFinal);
        }
      }
    }

    res.json({
      code: "success",
      message: "Thành công",
      jobs: dataFinal,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};
