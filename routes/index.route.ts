import { Router } from "express";
import userRoute from "./user.route";
import authRoute from "./auth.route";
import companyRoute from "./company.route";

const router = Router();

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/company", companyRoute);

export default router;
