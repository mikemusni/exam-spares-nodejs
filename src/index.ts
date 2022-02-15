console.clear();
import "dotenv/config";
import http from "http";
import app from "./appConfigs";

let port = 8000;
const server = http.createServer(app);
server.listen(port);
console.log(
  `Server is listening to PORT:${port} - ${new Date().toISOString()}`
);
