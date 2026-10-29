const { Router } = require("express");
import * as userController from "../controllers/user.controller";
import * as userValidate from "../validates/user.validate";
import multer from "multer";
import { storage } from "../helpers/cloudinary.helper";
import { verifyTokenUser } from "../middlewares/auth.middleware";

const router = Router();

const upload = multer({ storage: storage });

router.post(
  "/register",
  userValidate.registerPost,
  userController.registerPost,
);

router.post("/login", userValidate.loginPost, userController.loginPost);

router.patch(
  "/profile",
  verifyTokenUser,
  upload.single("avatar"),
  userValidate.profilePatch,
  userController.profilePatch,
);

router.get("/cv/list", verifyTokenUser, userController.cvList);

export default router;
