const { Router } = require("express");
import * as companyController from "../controllers/company.controller";
import * as companyValidate from "../validates/company.validate";
import multer from "multer";
import { storage } from "../helpers/cloudinary.helper";
import { verifyTokenCompany } from "../middlewares/auth.middleware";

const router = Router();

const upload = multer({ storage: storage });

router.post(
  "/register",
  companyValidate.registerPost,
  companyController.registerPost,
);

router.post("/login", companyValidate.loginPost, companyController.loginPost);

router.patch(
  "/profile",
  verifyTokenCompany,
  upload.single("logo"),
  companyValidate.profilePatch,
  companyController.profilePatch,
);

router.post(
  "/job/create",
  verifyTokenCompany,
  upload.array("images", 3),
  companyValidate.createJobPost,
  companyController.createJobPost,
);

router.get("/job/list", verifyTokenCompany, companyController.jobList);

router.get("/job/detail/:id", verifyTokenCompany, companyController.jobDetail);

router.patch(
  "/job/edit/:id",
  verifyTokenCompany,
  upload.array("images", 3),
  companyValidate.editJobPatch,
  companyController.editJobPatch,
);

router.delete(
  "/job/delete/:id",
  verifyTokenCompany,
  companyController.deleteJobDel,
);

export default router;
