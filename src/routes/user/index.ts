import { Router } from "express";
import * as controller from "./controller";
import * as midWareSession from "../../middleware/session";
import * as midWarePermission from "../../middleware/permission";
import * as constant from "../../constants";

const router = Router();
router.post("/login", controller.login);
router.post(
  "/page/:page",
  midWareSession.validate,
  midWarePermission.validate([
    constant.permission.ADMIN,
  ]),
  controller.list
);
router.get("/profile", midWareSession.validate, controller.profile);
router.get("/logout", midWareSession.validate, controller.logout);
export default router;
