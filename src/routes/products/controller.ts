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
import * as Products from "../../models/products";
import * as constant from "../../constants";
import * as helper from "../../helper";

const validSort: string[] = [
  'name',
  'carMake',
  'category'
];
const validOrderBy: string[] = [
  constant.sortTypes.ASCENDING,
  constant.sortTypes.DESCENDING,
];

const showCase: string[] = [
  constant.showCase.FEATURED,
  constant.showCase.POPULAR,
];

export const update = async (req: middleware.IRequest, res: Response) => {
  let { _id } = req.body;

  await check("brand", constant.products.EMPTY_BRAND)
    .notEmpty()
    .run(req);
  await check("category", constant.products.EMPTY_CATEGORY)
    .notEmpty()
    .run(req);
  await check("carMake", constant.products.EMPTY_CAR_MAKE)
    .notEmpty()
    .run(req);
  await check("description", constant.products.EMPTY_DESCRIPTION)
    .notEmpty()
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
    _id: new ObjectId(_id).valueOf()
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

  // if (await Products.isNameExist(body)) {
  //   return res.json({
  //     status: false,
  //     system: constant.products.EXIST_TITLE,
  //   });
  // }

  const dbResponse = await Products.update(body);

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
export const search = async (req: Request, res: Response) => {
  let { page } = req.params;

  await check("sort", constant.products.EMPTY_SORT).notEmpty().run(req);
  await check("sort", constant.products.INVALID_TYPE)
    .custom((value) => validSort.includes(value))
    .run(req);

  await check("orderBy", constant.products.EMPTY_ORDER).notEmpty().run(req);
  await check("orderBy", constant.products.INVALID_TYPE)
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
    search: req.body.search,
    page: newPage,
  };

  const dbResponse = await Products.search(body);
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

  const dbResponse = await Products.isIdExist(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
    response: dbResponse
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

  const dbResponse = await Products.remove(body);
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

export const category = async (req: Request, res: Response) => {
  let { type } = req.params;
  const body = {
    type
  };
  const dbResponse = await Products.category(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
    response: dbResponse
  });
}
export const showcase = async (req: Request, res: Response) => {
  await check("showcase", constant.products.INVALID_TYPE)
    .custom((value) => showCase.includes(value))
    .run(req);
  await check("size", constant.products.SIZE_EXCEEDED).isInt({ min:0, max: 8}).run(req);

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
    ...req.params,
    size: Number(req.params.size)
  };

  const dbResponse = await Products.showcase(body);
  if (!dbResponse) {
    return res.json({
      status: false,
      system: constant.system.NO_RECORD,
    });
  }

  return res.json({
    status: true,
    system: constant.system.SUCCESS,
    response: dbResponse
  });
};
