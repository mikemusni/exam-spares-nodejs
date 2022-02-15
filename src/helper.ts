import { Response } from "express";
import * as constant from "./constants";

export const page = (res: Response, page: string) => {
  let newPage = parseInt(page);
  if (!newPage) {
    res.json({
      status: false,
      system: constant.system.INVALID_PAGE,
    });
    return false;
  }

  if (!newPage) {
    newPage = 0;
  } else {
    newPage = newPage - 1;
  }
  return newPage;
};
