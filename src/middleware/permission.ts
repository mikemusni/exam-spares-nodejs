import { Response, NextFunction } from "express";
import * as middleware from "./session";
import * as constant from "../constants";

export const validate = (allow: string[]) => {
  return (req: middleware.IRequest, res: Response, next: NextFunction) => {
    let result = false;

    if (allow.includes(req.session.permission)) {
      result = true;
      next();
      return true;
    }

    if (!result) {
      return res.json({
        status: 0,
        system: constant.user.INVALID_PERMISSION,
      });
    }
  };
};
