import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import mongoose from "mongoose";
import { routes } from "./routes";
// import './workers/scrape'
// import './helpers/pdfGen'

const App: Application = express();
App.use(helmet());
App.disable("x-powered-by");

// set body parser
App.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
App.use(bodyParser.json());

// cors config
App.use(cors());

// routes config
routes(App);

// mongoose config
if(process.env.NODE_ENV !== "test") {
  mongoose.connect(process.env.MONGODB);
}

export default App;
