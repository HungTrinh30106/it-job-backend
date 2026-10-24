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
      if (req.query.city) {
        const city = await CityList.findOne({ name: `${req.query.city}` });

        if (city) {
          const companyList = await AccountCompany.find({ city: city.id });
          const companyIds = companyList.map((item) => item._id);
          find.companyId = { $in: companyIds };
        }
      }

      if (req.query.company) {
        const existCompany = await AccountCompany.findOne({
          companyName: `${req.query.company}`,
        });

        find.companyId = existCompany?._id;
      }

      if (req.query.keyword) {
        const regex = new RegExp(`${req.query.keyword}`, "i");
        find.title = regex;
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
