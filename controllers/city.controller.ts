import { Request, Response } from "express";
import CityList from "../models/city-list.model";

export const list = async (req: Request, res: Response) => {
  const cityList = await CityList.find({});

  try {
    res.json({
      code: "success",
      message: "Danh sách tỉnh thành",
      cityList: cityList,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đã có lỗi xảy ra",
    });
  }
};
