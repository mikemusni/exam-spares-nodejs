import { Request, Response, NextFunction } from "express";
import * as constant from "../constants";
import * as Session from "../models/session";

export interface IRequest extends Request {
  session: Session.ISession;
}

export const validate = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.json({
      status: false,
      system: constant.system.INVALID_TOKEN,
    });
  }

  const token = authorization.split(" ")[1];

  let session = await Session.validate(token);
  if (!session) {
    return res.json({
      status: false,
      system: constant.system.INVALID_SESSION,
    });
  } else {
    if (typeof session !== "boolean") {
      req.session = session;
    }
    next();
  }
};
