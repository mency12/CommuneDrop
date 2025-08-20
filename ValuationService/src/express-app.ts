import express from "express";
import cors from "cors";
import routes from "./routes";
import {
  httpLogger,
  HandleErrorWithLogger,
  RequestTimingMiddleware,
} from "./utils";
import { ResponseMiddleware } from "./middlewares/response.middleware";
import { RequestResponseLogger } from "./middlewares/logger.middleware";
import helmet from "helmet";

export const ExpressApp = async () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(RequestTimingMiddleware);
  app.use(httpLogger);
  app.use(RequestResponseLogger);
  app.use(ResponseMiddleware);

  app.get("/health", (_, res) => {
    res.success({ status: "ok" });
  });
  app.use("/valuation", routes);
  app.use(HandleErrorWithLogger);
  return app;
};
