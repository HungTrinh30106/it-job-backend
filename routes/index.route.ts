import { Router } from "express";
import userRoute from "./user.route";
import authRoute from "./auth.route";
import companyRoute from "./company.route";
import cityRoute from "./city.route";
import searchRoute from "./search.route";

const router = Router();

router.use("/user", userRoute);
router.use("/auth", authRoute);
router.use("/company", companyRoute);
router.use("/city", cityRoute);
router.use("/search", searchRoute);

export default router;
