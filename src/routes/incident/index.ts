import { Router } from "express";
import * as controller from "./controller";
import * as midWareSession from "../../middleware/session";
import * as midWarePermission from "../../middleware/permission";
import * as constant from "../../constants";

const router = Router();
router.post(
  "/update",
  midWareSession.validate,
  midWarePermission.validate([constant.permission.ADMIN]),
  controller.update
);
router.get(
  "/profile/:_id",
  midWareSession.validate,
  midWarePermission.validate([
    constant.permission.ADMIN,
    constant.permission.USER,
  ]),
  controller.profile
);
router.post(
  "/page/:page",
  midWareSession.validate,
  midWarePermission.validate([
    constant.permission.ADMIN,
    constant.permission.USER,
  ]),
  controller.list
);
router.delete(
  "/remove",
  midWareSession.validate,
  midWarePermission.validate([constant.permission.ADMIN]),
  controller.remove
);
router.put(
  "/view",
  midWareSession.validate,
  midWarePermission.validate([constant.permission.USER]),
  controller.view
);
router.put(
  "/resolve",
  midWareSession.validate,
  midWarePermission.validate([constant.permission.USER]),
  controller.resolve
);
export default router;
