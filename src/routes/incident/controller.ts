import { Request, Response } from "express";
import {
  check,
  validationResult,
  ValidationError,
  Result,
} from "express-validator";
import { ObjectId } from "mongodb";
import { isValidObjectId } from "mongoose";
import * as middleware from "../../middleware/session";
import * as Incident from "../../models/incident";
import * as constant from "../../constants";
import * as helper from "../../helper";

const validTypes: Incident.ITypeIncident[] = [
  Incident.ITypeIncident.FEATURE,
  Incident.ITypeIncident.BUG,
  Incident.ITypeIncident.TECHNICAL,
];
const validSort: string[] = [
  constant.orderTypes.DATE_CREATED,
  constant.orderTypes.DATE_UPDATED,
];
const validOrderBy: string[] = [
  constant.sortTypes.ASCENDING,
  constant.sortTypes.DESCENDING,
];

export const update = async (req: middleware.IRequest, res: Response) => {
  let { _id, assignedTo } = req.body;
  const { userId } = req.session;

  if (!isValidObjectId(assignedTo)) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
    });
  }

  await check("assignedTo", constant.incident.EMPTY_ASSIGN_TO)
    .notEmpty()
    .run(req);
  await check("title", constant.incident.EMPTY_TITLE).notEmpty().run(req);
  await check("description", constant.incident.EMPTY_DESCRIPTION)
    .notEmpty()
    .run(req);
  await check("type", constant.incident.INVALID_TYPE)
    .custom((value) => validTypes.includes(value))
    .run(req);

  const error: Result<ValidationError> = validationResult(req);
  const errors = error.array();
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      system: constant.system.FAILED,
      response: errors,
    });
  }

  const body = {
    ...req.body,
    _id: new ObjectId(_id).valueOf(),
    createdBy: userId,
  };

  if (!_id) {
    delete body._id;
  } else {
    if (!isValidObjectId(_id)) {
      return res.json({
        status: false,
        system: constant.system.INVALID_REQUEST,
      });
    }
  }

  if (await Incident.isNameExist(body)) {
    return res.json({
      status: false,
      system: constant.incident.EXIST_TITLE,
    });
  }

  const dbResponse = await Incident.update(body);

  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
  });
};
export const profile = async (req: Request, res: Response) => {
  let { _id } = req.params;

  if (!isValidObjectId(_id)) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
    });
  }

  const body = {
    ...req.params,
    _id: new ObjectId(_id),
  };

  const dbResponse = await Incident.isIdExist(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
    response: dbResponse,
  });
};
export const remove = async (req: Request, res: Response) => {
  let { _id } = req.body;

  if (!isValidObjectId(_id)) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
    });
  }

  const body = {
    ...req.body,
    _id: new ObjectId(_id).valueOf(),
  };

  const dbResponse = await Incident.remove(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
  });
};
export const list = async (req: Request, res: Response) => {
  let { page } = req.params;

  if(req.body.type){
    await check("type", constant.incident.INVALID_TYPE)
    .custom((value) => validTypes.includes(value))
    .run(req);
  }

  await check("sort", constant.incident.EMPTY_SORT).notEmpty().run(req);
  await check("sort", constant.incident.INVALID_TYPE)
    .custom((value) => validSort.includes(value))
    .run(req);

  await check("orderBy", constant.incident.EMPTY_ORDER).notEmpty().run(req);
  await check("orderBy", constant.incident.INVALID_TYPE)
    .custom((value) => validOrderBy.includes(value))
    .run(req);

  const error: Result<ValidationError> = validationResult(req);
  const errors = error.array();
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      system: constant.system.FAILED,
      response: errors,
    });
  }

  const newPage = helper.page(res, page);
  if (newPage === false) {
    return;
  }

  const body = {
    ...req.body,
    page: newPage,
  };

  const dbResponse = await Incident.list(body);
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
export const view = async (req: middleware.IRequest, res: Response) => {
  let { _id } = req.body;
  const { userId } = req.session;

  if (!isValidObjectId(_id)) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
    });
  }

  await check("_id", constant.incident.EMPTY_ID).notEmpty().run(req);
  await check("isViewed", constant.incident.INVALID_TYPE).isBoolean().run(req);

  const error: Result<ValidationError> = validationResult(req);
  const errors = error.array();
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
      response: errors,
    });
  }

  const body = {
    ...req.body,
    _id: new ObjectId(_id).valueOf(),
    assignedTo: userId,
  };
  const isIdExist: any = await Incident.isIdExist(body);
  if (!isIdExist) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  const dbResponse = await Incident.update(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
  });
};
export const resolve = async (req: middleware.IRequest, res: Response) => {
  let { _id, comment, isResolved } = req.body;
  const { userId } = req.session;

  if (!isValidObjectId(_id)) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
    });
  }

  await check("isResolved", constant.incident.INVALID_TYPE)
    .isBoolean()
    .run(req);

  const error: Result<ValidationError> = validationResult(req);
  const errors = error.array();
  if (!error.isEmpty()) {
    return res.json({
      status: false,
      system: constant.system.INVALID_REQUEST,
      response: errors,
    });
  }

  const body = {
    _id: new ObjectId(_id).valueOf(),
    comment: comment,
    isResolved: isResolved,
    assignedTo: userId,
  };

  const isIdExist: any = await Incident.isIdExist(body);
  if (!isIdExist) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  } else {
    if (isIdExist.assignedTo.toString() !== body.assignedTo.toString()) {
      return res.json({
        status: false,
        system: constant.system.DENIED_PERMISSION,
      });
    }
  }

  const dbResponse = await Incident.update(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
  });
};
