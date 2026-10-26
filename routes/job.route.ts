const { Router } = require("express");
import * as jobController from "../controllers/job.controller";
import * as jobValidate from "../validates/job.validate";
import multer from "multer";
import { storage } from "../helpers/cloudinary.helper";

const upload = multer({ storage: storage });

const router = Router();
router.get("/detail/:id", jobController.detail);

router.post(
  "/apply",
  upload.single("fileCV"),
  jobValidate.applyPost,
  jobController.applyPost,
);

export default router;
