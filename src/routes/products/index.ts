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
  controller.profile
);
router.post(
  "/search/:page",
  controller.search
);
router.get(
  "/showcase/:showcase/:size",
  controller.showcase
);
router.get(
  "/type/:type",
  controller.category
);
// router.delete(
//   "/remove",
//   midWareSession.validate,
//   midWarePermission.validate([constant.permission.ADMIN]),
//   controller.remove
// );
export default router;
