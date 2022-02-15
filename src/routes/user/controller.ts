import { Request, Response } from "express";
import {
  check,
  validationResult,
  ValidationError,
  Result,
} from "express-validator";
import * as constant from "../../constants";
import * as User from "../../models/user";
import * as Session from "../../models/session";
import * as middleware from "../../middleware/session";
import * as helper from "../../helper";

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  await check("username", constant.user.EMPTY_USERNAME).notEmpty().run(req);
  await check("password", constant.user.EMPTY_PASSWORD).notEmpty().run(req);

  const error: Result<ValidationError> = validationResult(req);
  const errors = error.array();

  if (!error.isEmpty()) {
    return res.json({
      status: false,
      system: constant.system.FAILED,
      response: errors,
    });
  }

  const dbResponse: User.IUser | boolean = await User.login(req.body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.user.INVALID_USER,
    });
  }
  if (typeof dbResponse !== "boolean") {
    let session: Session.ISession = {
      userId: dbResponse._id,
      username: dbResponse.username,
      permission: dbResponse.permission,
    };
    let response: Session.ISession | boolean = await Session.create(session);

    return res.json({
      status: true,
      system: constant.system.SUCCESS,
      response,
    });
  }
};
export const profile = async (req: middleware.IRequest, res: Response) => {
  res.json({
    status: true,
    system: constant.system.SUCCESS,
    response: req.session
  });
  return;
};
export const list = async (req: Request, res: Response) => {
  let { page } = req.params;

  const newPage = helper.page(res, page);
  if (newPage === false) {
    return;
  }

  const body = {
    ...req.body,
    page: newPage,
  };

  const dbResponse = await User.list(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
      response: {
        collection: [],
        pagination: {
            total: 0,
            totalPage: 0,
            page: 0,
            limit: 0
        }
      }
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
    response: dbResponse
  });
};
export const logout = async (req: middleware.IRequest, res: Response) => {
  const { token } = req.session;
  const dbResponse: boolean = await Session.remove(token);

  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.FAILED,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
  });
};
