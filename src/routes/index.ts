import { Application, Request, Response } from "express";
import user from "./user";
import products from "./products";
import * as constant from "../constants";

export const routes = (App: Application) => {
  // App.use("/user", user);
  App.use("/products", products);

  // App Routers failed
  App.use((req: Request, res: Response) => {
    res.status(404);
    res.json({
      status: false,
      system: constant.system.NOT_FOUND,
    });
    return false;
  });
  App.use((req: Request, res: Response) => {
    res.status(500);
    res.json({
      status: false,
      system: constant.system.ERROR_SERVER,
    });
  });
};
